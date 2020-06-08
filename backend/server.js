require('dotenv').config({ path: './backend/.env' })
const express = require('express')
const app = express()
const port = 3001
const mongoose = require('mongoose')
const nacl = require('tweetnacl')
nacl.util = require('tweetnacl-util')
const sha256 = require('crypto-js/sha256')
const axios = require('axios')
const Web3 = require('web3')

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
const BRIGHTID_NODE_URL = BRIGHTID_NODE_DOMAIN + '/brightid/v4'

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
        BRIGHTID_NODE_DOMAIN + '/DollarForEveryone/' + user.contextId
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

const sponsorUser = async (contextId) => {
  const message = 'Sponsor' + ',' + CONTEXT + ',' + contextId
  const msgHash = hash(message)
  console.log(process.env.CONTEXT_PK)
  const sk = nacl.util.decodeBase64(process.env.CONTEXT_SK)
  const sig = nacl.util.encodeBase64(nacl.sign.detached(nacl.util.decodeUTF8(message), sk))
  // Make sure sig works
  if (!nacl.sign.detached.verify(
    nacl.util.decodeUTF8(message), nacl.util.decodeBase64(sig), nacl.util.decodeBase64(process.env.CONTEXT_PK)
    )) {
    throw 'Invalid .env Signature Configuration'
  }

  const response = axios.put(BRIGHTID_NODE_URL + '/operations/' + msgHash, {
    context: CONTEXT,
    contextId,
    name: 'Sponsor',
    v: 4,
    sig
  })
}


const sendDollar = async (address) => {
  const txConfig = {
    to: address,
    value: web3.util.toHex(web3.util.toWei(.001, )), //TODO: get conversion from Eth to XDAI
    gas: 21000,
    gasPrice: 100000000,
    nonce: await web3.eth.getTransactionCount(web3.eth.defaultAccount),
    chainID: 1337 // ganache chain id
  }
  const transaction = new EthereumTx(txConfig)
  transaction.sign( Buffer.from(process.env.WALLET_PRIVATE_KEY, 'hex') )
  const serializedTransaction = transaction.serialize()
  const transactionId = web3.eth.sendRawTransaction('0x' + serializedTransaction.toString('hex') )


  // TODO: Send dollar
}

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
