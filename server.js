const express = require('express');
const bodyParser = require('body-parser');
const unirest = require('unirest');
const { sign } = require('crypto');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//twitter npm package to manage calls 
//-> https://www.npmjs.com/package/twitter
//-> https://www.npmjs.com/package/twitter-v2
const TwitterV1 = require('twitter');
const TwitterV2 = require('twitter-v2');
const clientv1 = getTwitterClient(1)
const clientv2 = getTwitterClient(2)

/*
Twitter API Calls
*/
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

app.get('/api/users', (req, res) => {
  
  let params = {
    q: 'Götze',
    page: 1,
    count: 20,
    include_entities: false
  };
  clientv1.get('users/search', params, function(error, users, response) {
    if (!error) {
      //console.log(users)
      console.log('retrieved ' + users.length + 'users')
      /*
      for(let i=0;i<users.length;i++) {
        console.log(users[i].screen_name)
      }
      */
      res.send({ data: users})
    }
    else {
      console.log(error);
      res.send({ data: 'ERROR: ' + error})
    }
  });

});


app.get('/api/tweets', (req, res) => {

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

app.get('/api/tweetdetails', async(req, res) => {
  
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
  const { TEST_VAR } = require('./config'); //get env var from config.js
  res.send({ express: 'Hello From Express: ' + TEST_VAR});
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