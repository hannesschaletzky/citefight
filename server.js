const express = require('express');
const bodyParser = require('body-parser');
const unirest = require('unirest');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

//for obtaining user token
var axios = require('axios');
var qs = require('qs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



/*
  PUSHER API
  https://github.com/pusher/pusher-js
  https://pusher.com/tutorials/react-websockets
*/
const PusherClient = require('pusher');
const pusher = getPusherClient()

function getPusherClient() {
  //get env vars
  const dotenv = require('dotenv');
  dotenv.config(); 
  const SERVER_PUSHER_APP_ID = process.env.SERVER_PUSHER_APP_ID
  const SERVER_PUSHER_KEY = process.env.SERVER_PUSHER_KEY
  const SERVER_PUSHER_SECRET = process.env.SERVER_PUSHER_SECRET
  const SERVER_PUSHER_CLUSTER = process.env.SERVER_PUSHER_CLUSTER
  /*
  console.log('SERVER_PUSHER_APP_ID: ' + SERVER_PUSHER_APP_ID)
  console.log('SERVER_PUSHER_KEY: ' + SERVER_PUSHER_KEY)
  console.log('SERVER_PUSHER_SECRET: ' + SERVER_PUSHER_SECRET)
  console.log('SERVER_PUSHER_CLUSTER: ' + SERVER_PUSHER_CLUSTER)
  */
  let client = new PusherClient({
    appId: SERVER_PUSHER_APP_ID,
    key: SERVER_PUSHER_KEY,
    secret: SERVER_PUSHER_SECRET,
    cluster: SERVER_PUSHER_CLUSTER
    //encrypted: true
  });
  return client
}

/* DEMO 
app.post('/api/pusher', (req, res) => {
  //const payload = req.body;
  const payload = {
    userName: 'testUserFromAPI',
    message: 'this is a test message from API'
  };
  pusher.trigger('chat', 'message', payload);
  console.log(payload)
  res.send(payload)
});
*/

app.post("/api/pusher/auth", function(req, res) {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const userID = req.query.id
  //let timestamp = new Date().toISOString();

  const presenceData = {
    user_id: userID,
    user_info: {
      name: "Mr Channels"
    }
  };
  const auth = pusher.authenticate(socketId, channel, presenceData);
  res.send(auth);
});


app.post('/api/pusher/setup/trigger', (req, res) => {

  //small letters for headers
  let channel = req.headers.pusherchannel
  let event = req.headers.pusherevent
  let socketID = req.headers.pushersocketid
  const payload = req.body;
  //console.log(socketID)

  //print byte size of request, max 10.000 Bytes for pusher
  let str = JSON.stringify(payload);
  //console.log(str)
  console.log('bytes: ' + str.length) //Buffer.byteLength(str, 'utf8')

  //trigger event
  pusher.trigger(channel, event, payload)
    .then(() => {
      res.send({'status':'200'})
    })
    .catch(err => {
        console.log('----------------')
        console.log('------ERROR-----')
        console.log('----------------')
        if (err.status === 413) {
          console.log('Maximum byte exceeded')
        }
        console.log(err.body)
        res.send({'status':'413'})
    })

  //pusher.trigger(channel, event, payload, socketID); -> indlucde socketID to exclude sender as recipient
});
















/*
  Twitter API
  twitter npm package to manage calls 
  -> https://www.npmjs.com/package/twitter
  -> https://www.npmjs.com/package/twitter-v2
*/
const TwitterV1 = require('twitter');
const TwitterV2 = require('twitter-v2');

function getTwitterClient(version, token, tokenSecret) {

  //get env vars
  const dotenv = require('dotenv');
  dotenv.config(); 
  const SERVER_TWITTER_API_Key = process.env.SERVER_TWITTER_API_Key
  const SERVER_TWITTER_API_Secret = process.env.SERVER_TWITTER_API_Secret
  let SERVER_TWITTER_Access_Token = token
  let SERVER_TWITTER_Access_Token_Secret = tokenSecret
  const SERVER_TWITTER_API_BEARER = process.env.SERVER_TWITTER_API_BEARER
  
  /*
  console.log('SERVER_TWITTER_API_Key: ' + SERVER_TWITTER_API_Key)
  console.log('SERVER_TWITTER_API_Secret: ' + SERVER_TWITTER_API_Secret)
  console.log('SERVER_TWITTER_Access_Token: ' + SERVER_TWITTER_Access_Token)
  console.log('SERVER_TWITTER_Access_Token_Secret: ' + SERVER_TWITTER_Access_Token_Secret)
  console.log('SERVER_TWITTER_API_BEARER: ' + SERVER_TWITTER_API_BEARER)
  */
  if (version === 1) {
    let client = new TwitterV1({
      consumer_key: SERVER_TWITTER_API_Key,
      consumer_secret: SERVER_TWITTER_API_Secret,
      access_token_key: SERVER_TWITTER_Access_Token,
      access_token_secret: SERVER_TWITTER_Access_Token_Secret
    });
    return client
  }
  else if (version === 2) {
    let client = new TwitterV2({
      consumer_key: SERVER_TWITTER_API_Key,
      consumer_secret: SERVER_TWITTER_API_Secret,
      bearer_token: SERVER_TWITTER_API_BEARER
    });
    return client
  }
}

let callLimit = 900
let windowSizeSeconds = 60*15 //15 mins 

let bot1_firstCall = new Date().toISOString()
let bot1_CallCount = 0
let bot2_firstCall = new Date().toISOString()
let bot2_CallCount = 0
let bot3_firstCall = new Date().toISOString()
let bot3_CallCount = 0

function getBotToken() {
  //get env vars
  const dotenv = require('dotenv');
  dotenv.config(); 
  let token = ""
  let token_secret = ""

  //check counter reset
  let now = new Date(), ref, diff;
  //BOT 1
  ref = new Date(bot1_firstCall)
  diff = now.getTime() - ref.getTime()
  if (diff > ((windowSizeSeconds)*1000)) {
    console.log('resetting bot1')
    bot1_firstCall = ref.toISOString()
    bot1_CallCount = 0
  }
  //BOT 2
  ref = new Date(bot2_firstCall)
  diff = now.getTime() - ref.getTime()
  if (diff > ((windowSizeSeconds)*1000)) {
    console.log('resetting bot2')
    bot2_firstCall = ref.toISOString()
    bot2_CallCount = 0
  }
  //BOT 3
  ref = new Date(bot3_firstCall)
  diff = now.getTime() - ref.getTime()
  if (diff > ((windowSizeSeconds)*1000)) {
    console.log('resetting bot3')
    bot3_firstCall = ref.toISOString()
    bot3_CallCount = 0
  }

  //determine bot to use
  //BOT 1
  if (bot1_CallCount < callLimit) {
    //set first-call-time
    if (bot1_CallCount === 0) {
      bot1_firstCall = new Date().toISOString()
    }
    //return credentials
    //console.log('use bot1')
    bot1_CallCount++
    return {'token':process.env.SERVER_TWITTER_Bot1_Token, 
            'token_secret':process.env.SERVER_TWITTER_Bot1_Token_Secret}
  }
  //BOT 2
  else if (bot2_CallCount < callLimit) {
    if (bot2_CallCount === 0) {
      bot2_firstCall = new Date().toISOString()
    }
    //console.log('use bot2')
    bot2_CallCount++
    return {'token':process.env.SERVER_TWITTER_Bot2_Token, 
            'token_secret':process.env.SERVER_TWITTER_Bot2_Token_Secret}
  }
  //BOT 3
  else if (bot3_CallCount < callLimit) {
    if (bot3_CallCount === 0) {
      bot3_firstCall = new Date().toISOString()
    }
    //console.log('use bot3')
    bot3_CallCount++
    return {'token':process.env.SERVER_TWITTER_Bot3_Token,
            'token_secret':process.env.SERVER_TWITTER_Bot3_Token_Secret}
  }

  //SEND MESSAGE OR SAVE SOMEWHERE THAT LIMIT WAS EXCEEDED -> ADD MORE BOTS THEN

  return {'token':'', 
          'token_secret':''}
}

app.get('/api/twitter/users', (req, res) => {
  
  //parse input and create params
  let q = req.headers.q
  let page = req.headers.page
  let token = req.headers.token
  let token_secret = req.headers.token_secret

  //get bot token if user did not provide own
  if (token === "" || token_secret === "") {
    let result = getBotToken()
    token = result.token
    token_secret = result.token_secret
    //check if still empty
    if (token === "" || token_secret === "") {
      res.send({
        status: 999,
        message: 'could not fetch bot access token or secret'
      })
      return
    }
  }

  

  let params = {
    q: q,
    page: page,
    count: 20,
    include_entities: false
  }
  //execute 
  let clientv1 = getTwitterClient(1, token, token_secret)
  clientv1.get('users/search', params, function(error, users, response) {
    if (!error) {
      //console.log('retrieved ' + users.length + 'users')
      res.send({ 
        status: 200,
        data: users
      })
    }
    else {
      let status = error[0].status
      let message = error[0].message
      console.log(status + ' ' + message);
      res.send({
        status: status,
        message: message
      })
    }
  });

});


app.get('/api/twitter/tweets', (req, res) => {

  let params = {
    user_id: '342599843',
    trim_user: true,
    exclude_replies: true,
    include_rts: false,
    count: 200
  }

  let clientv1 = getTwitterClient(1, token, token_secret) //token and secret missing
  clientv1.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
      console.log(tweets)
      res.send({ data: tweets})
    }
    else {
      console.log(error);
      res.send({ data: 'ERROR: ' + error})
    }
  })

});

app.get('/api/twitter/tweetdetails', async(req, res) => {
  
  var params = {
    ids: '1345396853815312385,1352681729736241158', 
    'tweet.fields': 'public_metrics,created_at',
    'expansions': 'attachments.media_keys',
    'media.fields': 'duration_ms,height,media_key,public_metrics,type,url,width'
  }
  let clientv2 = getTwitterClient(2, token, token_secret) //token and secret missing
  const { data, includes } = await clientv2.get('tweets', params)
  console.log(data)
  console.log(includes.media)

  res.send({ data: data, includes: includes})
});





/*
##################################
##################################
    OBTAINING USER ACCESS TOKEN
##################################
##################################

FROM TUTORIAL
Parameter-String
GOAL:   include_entities=true&oauth_consumer_key=xvz1evFS4wEEPTGEFPHBog&oauth_nonce=kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1318622958&oauth_token=370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb&oauth_version=1.0&status=Hello%20Ladies%20%2B%20Gentlemen%2C%20a%20signed%20OAuth%20request%21
ACTUAL: include_entities=true&oauth_consumer_key=xvz1evFS4wEEPTGEFPHBog&oauth_nonce=kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1318622958&oauth_token=370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb&oauth_version=1.0&status=Hello%20Ladies%20%2B%20Gentlemen%2C%20a%20signed%20OAuth%20request%21

Signature-Base-String
GOAL:   POST&https%3A%2F%2Fapi.twitter.com%2F1.1%2Fstatuses%2Fupdate.json&include_entities%3Dtrue%26oauth_consumer_key%3Dxvz1evFS4wEEPTGEFPHBog%26oauth_nonce%3DkYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1318622958%26oauth_token%3D370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb%26oauth_version%3D1.0%26status%3DHello%2520Ladies%2520%252B%2520Gentlemen%252C%2520a%2520signed%2520OAuth%2520request%2521
ACTUAL: POST&https%3A%2F%2Fapi.twitter.com%2F1.1%2Fstatuses%2Fupdate.json&include_entities%3Dtrue%26oauth_consumer_key%3Dxvz1evFS4wEEPTGEFPHBog%26oauth_nonce%3DkYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1318622958%26oauth_token%3D370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb%26oauth_version%3D1.0%26status%3DHello%2520Ladies%2520%252B%2520Gentlemen%252C%2520a%2520signed%2520OAuth%2520request%2521

SigningKey:
GOAL:   kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw&LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE
ACTUAL: kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw&LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE

Signature:
GOAL:   hCtSmYh+iHYCEqBWrE7C7hYmtUk=
ACTUAL: hCtSmYh+iHYCEqBWrE7C7hYmtUk=
--> ALL GOOD 

FROM POSTMAN:
GOAL:   cuYoen09oMIrAR6wiXvcIl6AY6A%3D
ACTUAL: cuYoen09oMIrAR6wiXvcIl6AY6A%3D
*/

//https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}


/*
##################################
##################################
          SIGNATURE
##################################
##################################
*/
function getSignature(params, baseURL, httpMethod, apiSecret, userSecret = "") {
  //percent encode every key & value
  let encodedParams = {}
  for (k in params) {
    const value = fixedEncodeURIComponent(params[k]);
    const key = fixedEncodeURIComponent(k);
    encodedParams[key] = value
  }
  //console.log(encodedParams)

  //order from A to Z
  let orderedParams = {};
  Object.keys(encodedParams).sort().forEach(function(k) {
      orderedParams[k] = encodedParams[k];
  });
  //console.log(orderedParams)

  //parameter-string
  let paramsString = ""
  for (k in orderedParams) {
    const value = orderedParams[k];
    const key = k;
    paramsString += key + '=' + value + '&'
  }
  paramsString = paramsString.substring(0, paramsString.length-1) //remove last &
  //console.log(paramsString)

  //signature base string
  let signatureBaseString = ""
  let baseURL_enc = fixedEncodeURIComponent(baseURL)
  let paramsString_enc = fixedEncodeURIComponent(paramsString) 
  signatureBaseString += httpMethod + '&'
  signatureBaseString += baseURL_enc + '&'
  signatureBaseString += paramsString_enc
  //console.log(signatureBaseString)

  //signing key
  let apiSecret_enc = fixedEncodeURIComponent(apiSecret)
  let signingKey = apiSecret_enc + '&'
  if (userSecret !== "") {
    let userSecret_enc = fixedEncodeURIComponent(userSecret)
    signingKey += userSecret_enc
  }
  //console.log(signingKey)

  //calculating signature (HMAC-SHA1 hashing)
  const crypto = require('crypto');
  const oauth_signature = crypto.createHmac("sha1", signingKey)
                                .update(signatureBaseString)
                                .digest()
                                .toString('base64');
  //console.log('\n' + oauth_signature)

  const oauth_signature_enc = fixedEncodeURIComponent(oauth_signature);
  console.log('\noauth_signature_enc: ' + oauth_signature_enc)
  return oauth_signature_enc
}

/*
##################################
##################################
          STEP 1
##################################
##################################
*/
app.get('/api/twitter/request_token', (req, res) => {

  const dotenv = require('dotenv');
  dotenv.config(); 
  const SERVER_TWITTER_API_Key = process.env.SERVER_TWITTER_API_Key
  const SERVER_TWITTER_API_Secret = process.env.SERVER_TWITTER_API_Secret

  const callback = 'http://localhost:3000/match/setup/twittercallback'
  const callback_enc = fixedEncodeURIComponent(callback)
  const baseURL = 'https://api.twitter.com/oauth/request_token'
  const httpMethod = 'POST';
  const params = {
    oauth_consumer_key: SERVER_TWITTER_API_Key,
    oauth_callback: callback,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.round(new Date().getTime() / 1000),
    oauth_nonce: "A",
    oauth_version: "1.0"
  }
  const oauth_signature_enc = getSignature(params, baseURL, httpMethod, SERVER_TWITTER_API_Secret)

  let oauthheader = 
    'OAuth'+
      ' oauth_consumer_key="'+SERVER_TWITTER_API_Key+'",'+
      ' oauth_signature_method="'+params.oauth_signature_method+'",'+
      ' oauth_timestamp="'+params.oauth_timestamp+'",'+
      ' oauth_nonce="'+params.oauth_nonce+'",'+
      ' oauth_version="'+params.oauth_version+'",'+
      ' oauth_callback="'+callback_enc+'",'+
      ' oauth_signature="'+oauth_signature_enc+'"'
  console.log(oauthheader)

  var config = {
    method: httpMethod,
    url: baseURL,
    headers: { 
      'Authorization': oauthheader
      }
  };

  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data))
    res.send({
      status: 200,
      body: response.data
    })
  })
  .catch(function (error) {
    console.log(error.response.data.errors[0])
    res.send({
        status: error.response.data.errors[0].code,
        body: error.response.data.errors[0].message
    })
  });

});

/*
##################################
##################################
          STEP 3
##################################
##################################

OAuth oauth_consumer_key="y5tnv0KUnZnaR81Jj2MKaBRH8",oauth_token="y_hBqwAAAAABLx8pAAABd9OLEMU",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1614161531",oauth_nonce="A",oauth_version="1.0",oauth_verifier="iTVLOeg3pzH5PfIGqFOyUxGYMzCteSgL",oauth_signature="1982Xm9KhfUn0DFMalyyv9Kn5Kk%3D"
OAuth oauth_consumer_key="y5tnv0KUnZnaR81Jj2MKaBRH8",oauth_token="y_hBqwAAAAABLx8pAAABd9OLEMU",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1614161531",oauth_nonce="A",oauth_version="1.0",oauth_verifier="iTVLOeg3pzH5PfIGqFOyUxGYMzCteSgL",oauth_signature="1982Xm9KhfUn0DFMalyyv9Kn5Kk%3D"
-> same

1982Xm9KhfUn0DFMalyyv9Kn5Kk%3D
1982Xm9KhfUn0DFMalyyv9Kn5Kk%3D
-> same
*/
app.get('/api/twitter/access_token', (req, res) => {

  const dotenv = require('dotenv');
  dotenv.config(); 
  const SERVER_TWITTER_API_Key = process.env.SERVER_TWITTER_API_Key
  const SERVER_TWITTER_API_Secret = process.env.SERVER_TWITTER_API_Secret
  let token = req.headers.token
  let token_verifier = req.headers.token_verifier
  console.log('token: ' + token)
  console.log('token_verifier: ' + token_verifier)

  const baseURL = 'https://api.twitter.com/oauth/access_token'
  const httpMethod = 'POST';
  const params = {
    oauth_consumer_key: SERVER_TWITTER_API_Key,
    oauth_token: token,
    oauth_verifier: token_verifier,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.round(new Date().getTime() / 1000),
    oauth_nonce: "A",
    oauth_version: "1.0"
  }
  const oauth_signature_enc = getSignature(params, baseURL, httpMethod, SERVER_TWITTER_API_Secret)

  let oauthheader = 
    'OAuth'+
      ' oauth_consumer_key="'+SERVER_TWITTER_API_Key+'",'+
      ' oauth_token="'+params.oauth_token+'",'+
      ' oauth_signature_method="'+params.oauth_signature_method+'",'+
      ' oauth_timestamp="'+params.oauth_timestamp+'",'+
      ' oauth_nonce="'+params.oauth_nonce+'",'+
      ' oauth_version="'+params.oauth_version+'",'+
      ' oauth_verifier="'+params.oauth_verifier+'",'+
      ' oauth_signature="'+oauth_signature_enc+'"'
  console.log(oauthheader)

  var config = {
    method: httpMethod,
    url: baseURL,
    headers: { 
      'Authorization': oauthheader
      }
  };

  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data))
    res.send({
      status: 200,
      body: response.data
    })
  })
  .catch(function (error) {
    console.log(error.response.status + ' - ' + error.response.statusText)
    res.send({
        status: error.response.status,
        body: error.response.statusText
    })
  });
});


/*
##################################
##################################
    Verify Account Credentials
##################################
##################################
*/
app.get('/api/twitter/verify_token', (req, res) => {

  const dotenv = require('dotenv');
  dotenv.config(); 
  const SERVER_TWITTER_API_Key = process.env.SERVER_TWITTER_API_Key
  const SERVER_TWITTER_API_Secret = process.env.SERVER_TWITTER_API_Secret
  let token = req.headers.token
  let token_secret = req.headers.token_secret 
  console.log('token: ' + token)
  console.log('token_secret: ' + token_secret)

  const baseURL = 'https://api.twitter.com/1.1/account/verify_credentials.json'
  const httpMethod = 'GET';
  const params = {
    oauth_consumer_key: SERVER_TWITTER_API_Key,
    oauth_token: token,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.round(new Date().getTime() / 1000),
    oauth_nonce: "A",
    oauth_version: "1.0"
  }
  const oauth_signature_enc = getSignature(params, baseURL, httpMethod, SERVER_TWITTER_API_Secret, token_secret)

  let oauthheader = 
    'OAuth'+
      ' oauth_consumer_key="'+SERVER_TWITTER_API_Key+'",'+
      ' oauth_token="'+params.oauth_token+'",'+
      ' oauth_signature_method="'+params.oauth_signature_method+'",'+
      ' oauth_timestamp="'+params.oauth_timestamp+'",'+
      ' oauth_nonce="'+params.oauth_nonce+'",'+
      ' oauth_version="'+params.oauth_version+'",'+
      ' oauth_signature="'+oauth_signature_enc+'"'
  console.log(oauthheader)

  var config = {
    method: httpMethod,
    url: baseURL,
    headers: { 
      'Authorization': oauthheader
      }
  };

  axios(config)
  .then(function (response) {
    //console.log(JSON.stringify(response.data))
    console.log('user verified')
    res.send({
      status: 200,
      body: response.data
    })
  })
  .catch(function (error) {
    console.log(error.response.status + ' - ' + error.response.statusText)
    res.send({
        status: error.response.status,
        body: error.response.statusText
    })
  });
});






app.get('/api/hello', (req, res) => {
  res.send({ data: 'Hello From Express'});
});

app.post('/api/world', (req, res) => {
  console.log(req.body);
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});






if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
    
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));