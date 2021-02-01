const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;
let unirest = require('unirest');
const oauthSignature = require('oauth-signature');
const { sign } = require('crypto');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API calls
app.get('/api/hello', (req, res) => {

  const { TEST_VAR } = require('./config'); //get env var from config.js

  res.send({ express: 'Hello From Express: ' + TEST_VAR});
});

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

app.get('/api/tweets/new', async(req, res) => {

  //get env vars -> @@REMOVE CONSOLE OUTPUT
  const dotenv = require('dotenv');
  dotenv.config(); 
  const SERVER_TWITTER_API_Key = process.env.SERVER_TWITTER_API_Key
  const SERVER_TWITTER_API_Secret = process.env.SERVER_TWITTER_API_Secret
  const SERVER_TWITTER_Access_Token = process.env.SERVER_TWITTER_Access_Token
  const SERVER_TWITTER_Access_Token_Secret = process.env.SERVER_TWITTER_Access_Token_Secret
  const SERVER_TWITTER_API_BEARER = process.env.SERVER_TWITTER_API_BEARER
  console.log('SERVER_TWITTER_API_Key: ' + SERVER_TWITTER_API_Key)
  console.log('SERVER_TWITTER_API_Secret: ' + SERVER_TWITTER_API_Secret)
  console.log('SERVER_TWITTER_Access_Token: ' + SERVER_TWITTER_Access_Token)
  console.log('SERVER_TWITTER_Access_Token_Secret: ' + SERVER_TWITTER_Access_Token_Secret)
  console.log('SERVER_TWITTER_API_BEARER: ' + SERVER_TWITTER_API_BEARER)


  const Twitter = require('twitter-v2');
  const client = new Twitter({
    consumer_key: SERVER_TWITTER_API_Key,
    consumer_secret: SERVER_TWITTER_API_Secret,
    bearer_token: SERVER_TWITTER_API_BEARER
  });
  
  var params = {
    ids: '1345396853815312385',
    'tweet.fields': 'public_metrics,created_at',
    'expansions': 'attachments.media_keys',
    'media.fields': 'duration_ms,height,media_key,public_metrics,type,url,width'
  };
  const { data } = await client.get('tweets', params);
  console.log(data);

  res.send({ express: data})
});


app.get('/api/users/new', (req, res) => {

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

  var Twitter = require('twitter');
  var client = new Twitter({
    consumer_key: SERVER_TWITTER_API_Key,
    consumer_secret: SERVER_TWITTER_API_Secret,
    access_token_key: SERVER_TWITTER_Access_Token,
    access_token_secret: SERVER_TWITTER_Access_Token_Secret
  });

  /*
  var params = {screen_name: 'nodejs'};
  client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
      console.log(tweets);
    }
  });
  */

  /*
  var params = {
    q: 'Götze',
    count: 1
  };
  client.get('users/search', params, function(error, tweets, response) {
    if (!error) {
      console.log(tweets);
    }
    else {
      console.log(error);
    }
  });
*/
  var params = {
    user_id: '342599843',
    trim_user: true
  };
  client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
      console.log(tweets);
    }
    else {
      console.log(error);
    }
  });

  res.send({ express: "THERE WILL BE NEW USERS: "})
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