/**
 * version 00.08
 */

// [START app]
'use strict';

// [START setup]
const express = require('express');
const bodyParser = require('body-parser');
const Buffer = require('safe-buffer').Buffer;
const path = require('path');

const app = express();

app.set('case sensitive routing', true);
app.use(bodyParser.json());

app.set('view engine', 'ejs');                          // set ejs
app.set('views', path.join(__dirname, '/responses'));   // ejs templates folder

// [END setup] 

// API ROUTE [diagnostics.versions.get] /versions ---------------------------------
app.all('/v', (req, res) => {
  res
    .status(200)
    .json({versions: 'v1.0 v1.1'})
    .end();
});

// API ROUTE [energy.type.get] /energy/{energy}/{period}/{epoch} --------------------
app.get('/energy/:energy?/:period?/:epoch?/:number?', (req, res) => {
  
  let type = req.params.type;
  let period = req.params.period; 
  let epoch = req.params.epoch; 
  let num = req.params.number;
  let site = req.query.site;

  const params = require("./lib/energy-params.js");

  let msg;

  type = !type ? 'hse' : type;
  period = (!period) ? 'now-period' : period;
  epoch = (!epoch) ? 'now-epoch' : epoch;
  num = (!num) ? 'num' : num;
  
  site = new params(1,2,3).getID();
  
  msg = type + ',' + period + ',' + epoch + ',' + num + ',' + site;
  
  res
    .status(200)
    .json({message: msg})
    .end();  
});

// API ROUTE [devices.datasets.post] /devices/{device}/datasets/{dataset} ---------------

// TEST ROUTE  
app.get('/devtest', (req, res) => {
    res.render('energy/index',{user: "Any User",title:"homepage"});
});


// AUTH -----------------------------------------------------------------------------
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

// LISTEN ------------------------------------------------------------------------
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
