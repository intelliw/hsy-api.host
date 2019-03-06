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

// API ROUTE [energymanagement.energy.type.get] --------------------------------------
app.get('/energy/:energyType?/:period?/:numPeriods?', (req, res) => {
  
  var energyType = req.params.energyType;
  var period = req.params.period; 
  var numPeriods = req.params.numPeriods;

  var msg;

  energyType = !energyType ? 'hse' : energyType;
  period = (!period) ? 'now' : period;
  numPeriods = (!numPeriods) ? '1' : numPeriods;

  msg = energyType + ',' + period + ',' + numPeriods;
  
  res
    .status(200)
    .json({message: msg})
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
