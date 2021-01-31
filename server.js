const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;
let unirest = require('unirest');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API calls
app.get('/api/hello', (req, res) => {

  const { TEST_VAR } = require('./config'); //get env var from config.js

  res.send({ express: 'Hello From Express: ' + TEST_VAR});
});

app.get('/api/tweets', (req, res) => {

  const { SERVER_TWITTER_API_BEARER } = require('./config'); //get env var from config.js
  //console.log(SERVER_TWITTER_API_BEARER)

  unirest('GET', 'https://api.twitter.com/2/tweets?ids=1345396853815312385&tweet.fields=public_metrics,created_at&expansions=attachments.media_keys&media.fields=duration_ms,height,media_key,public_metrics,type,url,width')
    .headers({
      'Authorization': 'Bearer ' + SERVER_TWITTER_API_BEARER
    })
    .end(function (response) { 
      if (response.error) throw new Error(response.error); 
      console.log(response.raw_body);
      res.send({ express: response.raw_body})
    });
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