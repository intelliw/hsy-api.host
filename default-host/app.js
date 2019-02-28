/**
 * version 00.08
 */

// [START app]
'use strict';

// [START setup]
const express = require('express');
const bodyParser = require('body-parser');
const Buffer = require('safe-buffer').Buffer;

const app = express();
const DEBUG = "(axc 00.10)"

app.set('case sensitive routing', true);
app.use(bodyParser.json());
// [END setup]

app.post('/echo', (req, res) => {
  res
    .status(200)
    .json({message: req.body.message + DEBUG})
    .end();
});

app.get('/energy/:type', (req, res) => {
  var energyType = req.params.type;
  res
    .status(200)
    .json({message: energyType + DEBUG})
    .end();  
});


function authInfoHandler(req, res) {
  let authUser = {id: 'anonymous'};
  const encodedInfo = req.get('X-Endpoint-API-UserInfo');
  if (encodedInfo) {
    authUser = JSON.parse(Buffer.from(encodedInfo, 'base64'));
  }
  res
    .status(200)
    .json(authUser)
    .end();
}

app.get('/auth/info/googlejwt', authInfoHandler);
app.get('/auth/info/googleidtoken', authInfoHandler);

if (module === require.main) {
  // [START listen]
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
  // [END listen]
}
// [END app]

module.exports = app;
