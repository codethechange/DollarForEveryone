require('dotenv').config({ path: './backend/.env' })
const express = require('express')
const app = express()
const port = 3001


const mongoose = require('mongoose')
const nacl = require('tweetnacl')
nacl.util = require('tweetnacl-util')
const axios = require('axios')
const Web3 = require('web3')
const stringify = require('fast-json-stable-stringify');

const { v4: uuidv4 } = require('uuid');
const CryptoJS = require('crypto-js')

const EthereumTx = require('ethereumjs-tx');

// TODO: Change provider to main net.
const web3 = new Web3(process.env.WEB3_PROVIDER_URI);

web3.eth.defaultAccount = process.env.ETH_ADDRESS

/**
 * On startup, print balance on account as a sanity check for Chain config.
 */
const printBalance = async () => {
  const myBalanceWei = await web3.eth.getBalance(web3.eth.defaultAccount)
  const myBalance = web3.utils.fromWei(myBalanceWei, 'ether') // 'ether' is just the chain token.
  console.log(`Your wallet balance is currently ${myBalance} XDai`)
}

// TODO: Setup password for database
mongoose.connect('mongodb://localhost/d4e', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const CONTEXT = 'DollarForEveryone'
const BRIGHTID_NODE_DOMAIN = process.env.BRIGHTID_NODE_DOMAIN
const BRIGHTID_NODE_URL = BRIGHTID_NODE_DOMAIN + '/brightid/v5'

const userSchema = new mongoose.Schema({
  contextId: String,
  verified: Boolean,
  creationDate: Date,
  receivedDate: Date,
  address: String
})

/**
 * From https://github.com/BrightID/BrightID/blob/9a9570dd0b1a39aafa770e1f3bf745259b023bc5/BrightID/src/utils/encoding.js#L37
 */
function b64ToUrlSafeB64 (s) {
  const alts = {
    '/': '_',
    '+': '-',
    '=': '',
  };
  return s.replace(/[/+=]/g, (c) => alts[c]);
}

function hash (data)  {
  const h = CryptoJS.SHA256(data);
  const b = h.toString(CryptoJS.enc.Base64);
  return b64ToUrlSafeB64(b);
};

const User = mongoose.model('User', userSchema)

/**
 * Be assigned a newly generated UUID for the BrightID
 * for your crypto wallet address
 * @param address your wallet address
 */
app.post('/deep-link/:address',async (req, res) => {
  // If user already assigned with address, then don't bother
  User.findOne({address: req.params.address}, (err, user) => {
    if (user) {
      const deepLink = 'brightid://link-verification/' +
        encodeURIComponent(BRIGHTID_NODE_DOMAIN) + `/${CONTEXT}/` + user.contextId
      res.send(deepLink)
    } else {
      const contextId = uuidv4()
      const newUser = new User({ 
        contextId, verified: false, 
        creationDate: Date.now(), address: req.params.address
      })
      newUser.save((err) => {
        if (err) {
          res.status(500).send('Server Error')
        } else {
          const deepLink = 'brightid://link-verification/' +
            BRIGHTID_NODE_DOMAIN + '/DollarForEveryone/' + contextId
          res.send(deepLink)
        }
      })
    }
  })
})

/**
 * From BrightID for Applications
 */
function getMessage(op) {
  const signedOp = {};
  for (let k in op) {
    if (['sig', 'sig1', 'sig2', 'hash'].includes(k)) {
      continue;
    }
    signedOp[k] = op[k];
  }
  return stringify(signedOp);
 }

/**
 * From BrightID for Applications
 */
function strToUint8Array(str) {
  return new Uint8Array(Buffer.from(str, 'ascii'));
}

/**
 * From BrightID for Applications
 */
function uInt8ArrayToB64(array) {
  const b = Buffer.from(array);
  return b.toString('base64');
}


const sponsorUser = async (contextId) => {
  
  const sk = nacl.util.decodeBase64(process.env.CONTEXT_SK)
  
  // From BrightID for Applications.
  const timestamp = Date.now()
  const op = {
    app: CONTEXT,
    contextId,
    name: 'Sponsor',
    timestamp,
    v: 5,
  }
  const message = getMessage(op)
  op.sig = uInt8ArrayToB64(
    Object.values(nacl.sign.detached(strToUint8Array(message), sk))
  );

  try {
    const response = await axios.post(BRIGHTID_NODE_URL + '/operations', op)
    console.log(response)
  } catch(error) {
    console.log(JSON.stringify(error.response.data))
  }
  
}

const sendDollar = async (address) => {
  const txConfig = {
    to: address,
    value: web3.util.toHex(web3.util.toWei(1)), 
    gas: 21000,
    gasPrice: 100000000,
    nonce: await web3.eth.getTransactionCount(web3.eth.defaultAccount),
    chainID: 1337 // ganache chain id
  }
  const transaction = new EthereumTx(txConfig)
  transaction.sign(Buffer.from(process.env.WALLET_PRIVATE_KEY, 'hex'))
  const serializedTransaction = transaction.serialize()
  const transactionId = web3.eth.sendRawTransaction('0x' + serializedTransaction.toString('hex'))

}

app.get("/api/status/:address", async (req, res) => {
  User.findOne({address: req.params.address}, async (err, user) => {
    if (user) {
      if (user.verified) {
        res.send({
          status: "VERIFIED"
        })
      } else if (user.contextId) {
        try {
          const response = await axios.get(
            BRIGHTID_NODE_URL + '/verifications/' + CONTEXT + '/' + user.contextId
          )
          if (response.data.data.unique) { // The user is deemed unique by BrightID
            // The context id has newly been verified! Let's update our state about this.
            user.verified = true
            await user.save().exec()
            await sendDollar()
            res.send({
              status: "VERIFIED"
            })
          } else {
            res.send({
              status: "LINKED"
            })
          }
        } catch(error) {
          const errorData = error.response.data
          if (errorData && errorData.errorNum == 2) { // contextId not found.
            res.send({
              status:"NOT LINKED"
            })
          } else if (errorData && errorData.errorNum == 4) { // linked, but not sponsored
            await sponsorUser(user.contextId)
            res.send({
              status: "LINKED"
            })
          } else if (errorData && errorData.errorNum == 3) { // not verified
            res.send({
              status:"LINKED"
            })
          }
        }
      }
    }
  })
})

/**
 * Check if verified: Determine if a user's uuid has been verified to a receive a dollar
 * TODO Check user id database 
 */
app.post('/receive-dollar/:address', async (req, res, next) => { 
  
  const address = req.params.address
  const user = await User.findOne({ address })
  if (!user.verified) {
    // They have not been verified yet!
    // Check if the contextId has been verified
    try {
      const response = await axios.get(
        BRIGHTID_NODE_URL + '/verifications/' + CONTEXT + '/' + user.contextId
      )  
      const data = response.data.data
      if (data.unique) { // The user is deemed unique by BrightID
        // The context id has newly been verified!
        user.verified = true
        await user.save().exec()
        await sendDollar(address)
        res.send('Success')
      } else {
        res.send({
          code: 406,
          error: true,
          errorMessage: 'user is not verified'
        })
      }

    } catch(error) {
      const data = error.response.data
      const errorMsg = data.errorMessage
      if (errorMsg === 'contextId not found' ||
          errorMsg === 'user can not be verified for this context') {
        res.send(data)
      } else if (errorMsg === 'user is not sponsored') {
        sponsorUser(user.contextId);
        res.send(data)
      } else {
        // Uncaught error: pass it to Express middleware.
        next(error)
      }
    }
      
    } else {
      res.send({
        code: 400,
        error: true,
        errorMessage: 'Already received dollar.'
      })
    } 
  
})


app.listen(port, () => {
  console.log(`Server listening on port ${port}!`)
  printBalance()
})
