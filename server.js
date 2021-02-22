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
const clientv1 = getTwitterClient(1)
const clientv2 = getTwitterClient(2)

function getTwitterClient(version) {

  //get env vars
  const dotenv = require('dotenv');
  dotenv.config(); 
  const SERVER_TWITTER_API_Key = process.env.SERVER_TWITTER_API_Key
  const SERVER_TWITTER_API_Secret = process.env.SERVER_TWITTER_API_Secret
  const SERVER_TWITTER_Access_Token = process.env.SERVER_TWITTER_Access_Token
  const SERVER_TWITTER_Access_Token_Secret = process.env.SERVER_TWITTER_Access_Token_Secret
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

app.get('/api/twitter/users', (req, res) => {
  
  //console.log(req.headers.testkey)
  let q = req.headers.q
  let page = req.headers.page

  console.log(req.headers.q)
  console.log(req.headers.page)


  let params = {
    q: q,
    page: page,
    count: 20,
    include_entities: false
  };
  clientv1.get('users/search', params, function(error, users, response) {
    if (!error) {
      //console.log(users) 
      console.log('retrieved ' + users.length + 'users')
      res.send({ 
        status: 200,
        data: users
      })
    }
    else {
      console.log(error);
      let status = error[0].status
      let message = error[0].message
      res.send({
        status: status,
        message: message
      })
    }
  });

});










/*
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

app.get('/api/twitter/postTweetNew', (req, res) => {

  const dotenv = require('dotenv');
  dotenv.config(); 
  let SERVER_TWITTER_API_Key = process.env.SERVER_TWITTER_API_Key
  let SERVER_TWITTER_API_Secret = process.env.SERVER_TWITTER_API_Secret
  let SERVER_TWITTER_Access_Token = process.env.SERVER_TWITTER_Access_Token
  let SERVER_TWITTER_Access_Token_Secret = process.env.SERVER_TWITTER_Access_Token_Secret

  const params = {
    status: 'Hello Ladies + Gentlemen, a signed OAuth request!',
    include_entities: true,
    oauth_consumer_key: SERVER_TWITTER_API_Key,
    oauth_token: SERVER_TWITTER_Access_Token,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: "1614013615",
    oauth_nonce: "A",
    oauth_version: "1.0"
  }
  const baseURL = 'https://api.twitter.com/1.1/statuses/update.json'
  const httpMethod = 'POST';


  //SIGNATURE START
  //percent encode every key & value
  let encodedParams = {}
  for (k in params) {
    const value = fixedEncodeURIComponent(params[k]);
    const key = fixedEncodeURIComponent(k);
    encodedParams[key] = value
  }
  console.log(encodedParams)

  //order from A to Z
  let orderedParams = {};
  Object.keys(encodedParams).sort().forEach(function(k) {
      orderedParams[k] = encodedParams[k];
  });
  console.log(orderedParams)

  //parameter-string
  let paramsString = ""
  for (k in orderedParams) {
    const value = orderedParams[k];
    const key = k;
    paramsString += key + '=' + value + '&'
  }
  paramsString = paramsString.substring(0, paramsString.length-1) //remove last &
  console.log(paramsString)

  //signature base string
  let signatureBaseString = ""
  let baseURL_enc = fixedEncodeURIComponent(baseURL)
  let paramsString_enc = fixedEncodeURIComponent(paramsString) 
  signatureBaseString += httpMethod + '&'
  signatureBaseString += baseURL_enc + '&'
  signatureBaseString += paramsString_enc
  console.log(signatureBaseString)

  //signing key
  let consumerSecret_enc = fixedEncodeURIComponent(SERVER_TWITTER_API_Secret)
  let accessSecrent_enc = fixedEncodeURIComponent(SERVER_TWITTER_Access_Token_Secret)
  let signingKey = consumerSecret_enc + '&' + accessSecrent_enc
  console.log(signingKey)

  //calculating signature (HMAC-SHA1 hashing)
  const crypto = require('crypto');
  const oauth_signature = crypto.createHmac("sha1", signingKey)
                                .update(signatureBaseString)
                                .digest()
                                .toString('base64');
  console.log('\n' + oauth_signature)

  const oauth_signature_enc = fixedEncodeURIComponent(oauth_signature);
  console.log('\n' + oauth_signature_enc)
  //SIGNATURE END

  let oauthheader = 
    'OAuth'+
      ' oauth_consumer_key="'+SERVER_TWITTER_API_Key+'",'+
      ' oauth_token="'+SERVER_TWITTER_Access_Token+'",'+
      ' oauth_signature_method="'+params.oauth_signature_method+'",'+
      ' oauth_timestamp="'+params.oauth_timestamp+'",'+
      ' oauth_nonce="'+params.oauth_nonce+'",'+
      ' oauth_version="'+params.oauth_version+'",'+
      ' oauth_signature="'+oauth_signature_enc+'"'
  console.log(oauthheader)
  
  //WORKING
  //oauthheader = 'OAuth oauth_consumer_key="y5tnv0KUnZnaR81Jj2MKaBRH8",oauth_token="1349709202332246017-1lrVoVZ7PhPhTGmeWe25QbCdPzSpK0",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1614013615",oauth_nonce="A",oauth_version="1.0",oauth_signature="cuYoen09oMIrAR6wiXvcIl6AY6A%3D"'

  var data = qs.stringify({
    'status': params.status,
    'include_entities': params.include_entities
  });
  var config = {
    method: httpMethod,
    url: baseURL,
    headers: { 
      'Authorization': oauthheader, 
      'Content-Type': 'application/x-www-form-urlencoded'
      },
    data : data
  };

  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data))
    res.send({
      status: 200,
      body: res.raw_body
    })
  })
  .catch(function (error) {
    console.log(error)
    res.send({
        status: 400,
        body: 'ERROR'
    })
  });
    
});




/*
app.get('/api/twitter/userAuth', (req, response) => {

  unirest('POST', 'https://api.twitter.com/oauth/request_token')
    .headers({
      'Authorization': 'OAuth oauth_consumer_key="y5tnv0KUnZnaR81Jj2MKaBRH8",'+
      'oauth_signature_method="HMAC-SHA1",'+
      'oauth_timestamp="1613733259",'+
      'oauth_nonce="ylJqUbqxWWa",'+
      'oauth_callback="http%3A%2F%2Flocalhost%3A3000%2Fstart",'+
      'oauth_signature="kd5MK2%2FtlOsARs%2BxNLcUiTyKW2k%3D"',
    })
    .end(function (res) { 
      if (res.error) {
        console.log(res.error)
        //IMPLEMENT ERROR HANDLING
          response.send({
            status: 400,
            body: 'ERROR'
        })
      }
      console.log(res.raw_body);
      response.send({
        status: 200,
        body: res.raw_body
      })
    });

});
*/








app.get('/api/twitter/tweets', (req, res) => {

  let params = {
    user_id: '342599843',
    trim_user: true,
    exclude_replies: true,
    include_rts: false,
    count: 200
  };
  clientv1.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
      console.log(tweets)
      res.send({ data: tweets})
    }
    else {
      console.log(error);
      res.send({ data: 'ERROR: ' + error})
    }
  });

});

app.get('/api/twitter/tweetdetails', async(req, res) => {
  
  var params = {
    ids: '1345396853815312385,1352681729736241158', 
    'tweet.fields': 'public_metrics,created_at',
    'expansions': 'attachments.media_keys',
    'media.fields': 'duration_ms,height,media_key,public_metrics,type,url,width'
  };
  const { data, includes } = await clientv2.get('tweets', params)
  console.log(data)
  console.log(includes.media)

  res.send({ data: data, includes: includes})
});




/*
app.get('/api/tweets', (req, res) => {

  //get env vars -> @@REMOVE CONSOLE OUTPUT
  const dotenv = require('dotenv');
  dotenv.config(); 
  const SERVER_TWITTER_API_BEARER = process.env.SERVER_TWITTER_API_BEARER
  console.log('SERVER_TWITTER_API_BEARER: ' + SERVER_TWITTER_API_BEARER)

  unirest('GET', 'https://api.twitter.com/2/tweets?ids=1345396853815312385&tweet.fields=public_metrics,created_at&expansions=attachments.media_keys&media.fields=duration_ms,height,media_key,public_metrics,type,url,width')
    .headers({
      'Authorization': 'Bearer ' + SERVER_TWITTER_API_BEARER
    })
    .end(function (response) { 
      if (response.error) throw new Error(response.error); 
      console.log(response);
      res.send({ express: response.raw_body})
    });
});
*/

/*
  //get env vars @@REMOVE CONSOLE OUTPUT
  const dotenv = require('dotenv');
  dotenv.config(); 
  const SERVER_TWITTER_API_Key = process.env.SERVER_TWITTER_API_Key
  const SERVER_TWITTER_API_Secret = process.env.SERVER_TWITTER_API_Secret
  const SERVER_TWITTER_Access_Token = process.env.SERVER_TWITTER_Access_Token
  const SERVER_TWITTER_Access_Token_Secret = process.env.SERVER_TWITTER_Access_Token_Secret
  console.log('SERVER_TWITTER_API_Key: ' + SERVER_TWITTER_API_Key)
  console.log('SERVER_TWITTER_API_Secret: ' + SERVER_TWITTER_API_Secret)
  console.log('SERVER_TWITTER_Access_Token: ' + SERVER_TWITTER_Access_Token)
  console.log('SERVER_TWITTER_Access_Token_Secret: ' + SERVER_TWITTER_Access_Token_Secret)

  var client = new Twitter({
    consumer_key: SERVER_TWITTER_API_Key,
    consumer_secret: SERVER_TWITTER_API_Secret,
    access_token_key: SERVER_TWITTER_Access_Token,
    access_token_secret: SERVER_TWITTER_Access_Token_Secret
  });
  */

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








/*
app.post("/api/pusher/auth", function(req, res) {

  //app.use cors
  //useTLS in pusherclient

  let socketId = req.headers.socketid
  let channel = req.headers.pusherchannel
  const presenceData = {
    user_id: "unique_user_id",
    user_info: {
      name: "Mr Channels",
      twitter_id: "@pusher"
    }
  };
  const auth = pusher.authenticate(socketId, channel, presenceData);
  res.send(auth);
});
*/