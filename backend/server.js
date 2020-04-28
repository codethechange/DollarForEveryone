require('dotenv').config({ path: './backend/.env' })
const express = require('express')
const app = express()
const port = 3001
const mongoose = require('mongoose')
const nacl = require('tweetnacl')
nacl.util = require('tweetnacl-util')
const sha256 = require('crypto-js/sha256')
const axios = require('axios')
const { v4: uuidv4 } = require('uuid');
const CryptoJS = require('crypto-js')

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
app.post('/deep-link/:address', (req, res) => {
  // If user already assigned with address, then don't bother
  User.findOne({address: req.params.address}, (err, user) => {
    if (user) {
      console.log('USER' + user)
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

const sponsorUser = (contextId) => {
  const message = 'Sponsor' + ',' + CONTEXT + ',' + contextId
  const msgHash = hash(message)
  console.log(process.env.CONTEXT_PK)
  const sk = nacl.util.decodeBase64(process.env.CONTEXT_SK)
  const sig = nacl.util.encodeBase64(nacl.sign.detached(nacl.util.decodeUTF8(message), sk))
  // Make sure sig works
  if (!nacl.sign.detached.verify(
    nacl.util.decodeUTF8(message), nacl.util.decodeBase64(sig), nacl.util.decodeBase64(process.env.CONTEXT_PK)
    )) {
    throw 'GAHHH' // Works!! yay!
  }
  console.log({
    context: CONTEXT,
    contextId,
    name: 'Sponsor',
    v: 4,
    sig
  })
  console.log(BRIGHTID_NODE_URL + '/operations/' + msgHash)

  axios.put(BRIGHTID_NODE_URL + '/operations/' + msgHash, {
    context: CONTEXT,
    contextId,
    name: 'Sponsor',
    v: 4,
    sig
  }).then(response => {
    if (response.error) {
      // TODO: handle different error messages
      throw response.errorMessage
    } else {
      user.save((err) => {
        if (err) {
          throw 'Save Error'
        } else {
          const deepLink = 'brightid://link-verification/' +
            BRIGHTID_NODE_DOMAIN + '/DollarForEveryone/' + contextId
          res.send(deepLink)
        }
      })
    }
  })
  .catch(response => {
    res.send(response.toJSON())
  })
}


const sendDollar = (address) => {
  // TODO: send dollar to address, update receivedDate()
}

/**
 * Check if verified: Determine if a user's uuid has been verified to a receive a dollar
 * TODO Check user id database 
 */
app.post('/receive-dollar/:address', (req, res) => { 
  const address = req.params.address
  User.findOne({ address, verified: false }, (err, user) => {
    if (err || !user) {
      res.status(500).send('Server Error')
      return
    }
    // They have not been verified yet!
    // Check if the contextId has been verified
    axios.get(BRIGHTID_NODE_URL + '/verifications/' + CONTEXT + '/' + user.contextId)
    .then(response => {
      if (response.error) {
        res.status(response.code).send(response.errorMessage)
        return
      }
      if (response.data) {
        const data = response.data
        if (data.errorMessage) {
          if (data.errorMessage === 'user is not sponsored') {
            sponsorUser();
          }
        } else {
          // The context id has newly been verified!
          user.verified = true
          user.save().then((err) => {
            if (err) {
              res.status(500).send('Server Error')
              return
            }
            // TODO: Send dollar
            sendDollar(address)
            res.send('Success')
          })
        } 
      }      
    })
  })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))