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
const API_VERSIONS = "v0.0.04"

app.set('case sensitive routing', true);
app.use(bodyParser.json());
// [END setup]

// API ROUTE [versions.v.get] ---------------------------------------------------------
app.get('/v', (req, res) => {
  res
    .status(200)
    .json({message: 'Versions ' + API_VERSIONS})
    .end();
});

// API ROUTE [energy.type.get] /energy/{type}/{period}/{epoch} --------------------------------------
app.get('/energy/:type?/:period?/:epoch?/:number?', (req, res) => {
  
  var type = req.params.type;
  var period = req.params.period; 
  var epoch = req.params.epoch; 
  var num = req.params.number;

  var msg;

  type = !type ? 'hse' : type;
  period = (!period) ? 'now' : period;
  epoch = (!epoch) ? 'now' : epoch;
  num = (!num) ? '1' : num;

  msg = type + ',' + period + ',' + epoch + ',' + num;
  
  res
    .status(200)
    .json({message: msg})
    .end();  
});

// API ROUTE [devices.datasets.post]



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
