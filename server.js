const express = require('express');
const bodyParser = require('body-parser');
const unirest = require('unirest');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

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
  OAUTH USER TOKEN
  //let apiKey = y5tnv0KUnZnaR81Jj2MKaBRH8
*/

/*
function getSignature(parameters, base_url, method, secret) {

  console.log(parameters)

  let ordered = {};
  Object.keys(parameters).sort().forEach(function(key) {
      ordered[key] = parameters[key];
  });
  let encodedParameters = '';
  for (k in ordered) {
    const encodedValue = escape(ordered[k]);
    const encodedKey = encodeURIComponent(k);
    if(encodedParameters === ''){
      encodedParameters += encodeURIComponent(`${encodedKey}=${encodedValue}`)
    }
    else{
    encodedParameters += encodeURIComponent(`&${encodedKey}=${encodedValue}`);
    }
  }
  console.log(encodedParameters);



  //const method = 'POST';
  //const base_url = 'https://api.twitter.com/oauth/request_token';
  const encodedUrl = encodeURIComponent(base_url);
  encodedParameters = encodeURIComponent(encodedParameters); 
  const signature_base_string = `${method}&${encodedUrl}&${encodedParameters}`
  console.log(signature_base_string)

  const signing_key = `${secret}&`;



  const crypto = require('crypto');
  const oauth_signature = crypto.createHmac("sha1", signing_key).update(signature_base_string).digest().toString('base64');
  console.log(oauth_signature);

  const encoded_oauth_signature = encodeURIComponent(oauth_signature);
  console.log(encoded_oauth_signature);

  return encoded_oauth_signature
}
*/





app.get('/api/twitter/userAuth', (req, response) => {

  const dotenv = require('dotenv');
  dotenv.config(); 
  const SERVER_TWITTER_API_Key = process.env.SERVER_TWITTER_API_Key
  const SERVER_TWITTER_API_Secret = process.env.SERVER_TWITTER_API_Secret
  
  const baseURL = 'https://api.twitter.com/oauth/request_token'
  const httpMethod = 'POST';
  const callback_encoded = "http%3A%2F%2Flocalhost%3A3000%2Fstart"
  const callback = "http://localhost:3000/start"
  
  const params = {
        oauth_consumer_key:SERVER_TWITTER_API_Key,
        oauth_token:SERVER_TWITTER_API_Secret,
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: "1613903399",
        oauth_nonce: "A",
        oauth_callback: callback,
        oauth_version: "1.0"
  }
  console.log(params)

  //percent encode every key & value
  let encodedParams = {}
  for (k in params) {
    const value = encodeURIComponent(params[k]);
    const key = encodeURIComponent(k);
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
    const value = encodeURIComponent(orderedParams[k]);
    const key = encodeURIComponent(k);
    paramsString += key + '=' + value + '&'
  }
  paramsString = paramsString.substring(0, paramsString.length-1) //remove last &
  console.log(paramsString)

  //signature base string
  let signatureBaseString = ""
  let baseURL_enc = encodeURIComponent(baseURL)
  let paramsString_enc = encodeURIComponent(paramsString) 
  signatureBaseString += httpMethod + '&'
  signatureBaseString += baseURL_enc + '&'
  signatureBaseString += paramsString_enc
  console.log(signatureBaseString)
  //The percent ‘%’ characters in the parameter string should be encoded as %25 in the signature base string.
  //oauth_callback=http%253A%252F%252Flocalhost%253A3000%252Fstart
  //oauth_callback%3Dhttp%25253A%25252F%25252Flocalhost%25253A3000%25252Fstart

  //signing key
  let consumerSecret_enc = encodeURIComponent(SERVER_TWITTER_API_Secret)
  let signingKey = consumerSecret_enc + '&'
  console.log(signingKey)

  //calculating signature (HMAC-SHA1 hashing)
  const crypto = require('crypto');
  const oauth_signature = crypto.createHmac("sha1", signingKey)
                                .update(signatureBaseString)
                                .digest()
                                .toString('base64');
  console.log('\n' + oauth_signature)

  //const oauth_signature_enc = encodeURIComponent(oauth_signature);
  //console.log('\n' + oauth_signature_enc)
  
  
  //execute
  unirest(httpMethod, baseURL)
    .headers({
      'Authorization': 'OAuth '+
      'oauth_consumer_key="'+SERVER_TWITTER_API_Key+'",'+
      'oauth_signature_method="'+params.oauth_signature_method+'",'+
      'oauth_timestamp="'+params.oauth_timestamp+'",'+
      'oauth_nonce="'+params.oauth_nonce+'",'+
      'oauth_callback="'+callback_encoded+'",'+
      'oauth_signature="'+oauth_signature+'"'
    })
    .end(function (res) { 
      if (res.error) {
        console.log('\n' + res.raw_body)
          response.send({
            status: 400,
            body: 'ERROR'
        })
      }
      else {
        console.log(res.raw_body);
        response.send({
          status: 200,
          body: res.raw_body
        })
      }
    });
    
});






/*
app.get('/api/twitter/userAuth', (req, response) => {

  const dotenv = require('dotenv');
  dotenv.config(); 
  const SERVER_TWITTER_API_Key = process.env.SERVER_TWITTER_API_Key
  const SERVER_TWITTER_API_Secret = process.env.SERVER_TWITTER_API_Secret

  const timestamp = "1613733259"
  const nonce = "ylJqUbqxWWa"; 
  const oauth_method = "HMAC-SHA1";
  const version = "1.0"
  const callback_encoded = "http%3A%2F%2Flocalhost%3A3000%2Fstart"
  const callback = "http://localhost:3000/start"
  const base_url = 'https://api.twitter.com/oauth/request_token'
  const httpMethod = 'POST';

  const parameters = {
        oauth_consumer_key:SERVER_TWITTER_API_Key,
        oauth_signature_method: oauth_method,
        oauth_timestamp: timestamp,
        oauth_nonce: nonce,
        oauth_callback: callback,
        oauth_version: version
  }

  //start creation
  console.log(parameters)

  let ordered = {};
  Object.keys(parameters).sort().forEach(function(key) {
      ordered[key] = parameters[key];
  });
  let encodedParameters = '';
  for (k in ordered) {
    const encodedValue = escape(ordered[k]);
    const encodedKey = encodeURIComponent(k);
    if(encodedParameters === ''){
      encodedParameters += encodeURIComponent(`${encodedKey}=${encodedValue}`)
    }
    else{
    encodedParameters += encodeURIComponent(`&${encodedKey}=${encodedValue}`);
    }
  }
  console.log('\n encodedParameters: ' + encodedParameters)


  const encodedUrl = encodeURIComponent(base_url);
  encodedParameters = encodeURIComponent(encodedParameters); 
  const signature_base_string = `${httpMethod}&${encodedUrl}&${encodedParameters}`
  console.log('\n signature_base_string: ' + signature_base_string)

  const crypto = require('crypto');
  const signing_key = `${SERVER_TWITTER_API_Secret}&`;
  const oauth_signature = crypto.createHmac("sha1", signing_key).update(signature_base_string).digest().toString('base64');
  console.log('\n oauth_signature: ' + oauth_signature)

  const encoded_oauth_signature = encodeURIComponent(oauth_signature);
  console.log('\n encoded_oauth_signature: ' + encoded_oauth_signature)

  //execute
  unirest(httpMethod, base_url)
    .headers({
      'Authorization': 'OAuth '+
      'oauth_consumer_key="'+SERVER_TWITTER_API_Key+'",'+
      'oauth_signature_method="HMAC-SHA1",'+
      'oauth_timestamp="'+timestamp+'",'+
      'oauth_nonce="'+nonce+'",'+
      'oauth_callback="'+callback_encoded+'",'+
      'oauth_signature="'+encoded_oauth_signature+'"'
    })
    .end(function (res) { 
      if (res.error) {
        console.log('\n' + res.raw_body)
          response.send({
            status: 400,
            body: 'ERROR'
        })
      }
      else {
        console.log(res.raw_body);
        response.send({
          status: 200,
          body: res.raw_body
        })
      }
    });
});
*/












app.get('/api/twitter/userAuthNew', (req, response) => {

  
  //console.log(req.headers.testkey)
  let signature = req.headers.sig
  let time = req.headers.time
  let nonce = req.headers.nonce


  console.log('signature: ' + signature)
  console.log('time: ' + time)
  console.log('nonce: ' + nonce)

  const dotenv = require('dotenv');
  dotenv.config(); 
  const SERVER_TWITTER_API_Key = process.env.SERVER_TWITTER_API_Key
  console.log('SERVER_TWITTER_API_Key: ' + SERVER_TWITTER_API_Key)

  let oauthString = 
    'OAuth oauth_consumer_key="'+SERVER_TWITTER_API_Key+'",'+
      'oauth_signature_method="HMAC-SHA1",'+
      'oauth_timestamp="'+time+'",'+
      'oauth_nonce="'+nonce+'",'+
      'oauth_callback="http%3A%2F%2Flocalhost%3A3000%2Fstart",'+
      'oauth_signature="'+signature+'"'

  unirest('POST', 'https://api.twitter.com/oauth/request_token')
    .headers({
      'Authorization': oauthString
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
    


  /*
  const timestamp = "1613733259"

  let oauthString = 
    'OAuth oauth_consumer_key="y5tnv0KUnZnaR81Jj2MKaBRH8",'+
      'oauth_signature_method="HMAC-SHA1",'+
      'oauth_timestamp="'+timestamp+'",'+
      'oauth_nonce="ylJqUbqxWWa",'+
      'oauth_callback="http%3A%2F%2Flocalhost%3A3000%2Fstart",'+
      'oauth_signature="kd5MK2%2FtlOsARs%2BxNLcUiTyKW2k%3D"'

  unirest('POST', 'https://api.twitter.com/oauth/request_token')
    .headers({
      'Authorization': oauthString
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
    */

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