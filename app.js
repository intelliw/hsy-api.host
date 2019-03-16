/**
 * version 00.08
 */

'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const Buffer = require('safe-buffer').Buffer;

const host = require('./host');           // common services
const path = require('./paths');           // routes

// [START setup]------------------------------

host.config.initialise(app);                // configuration settings

app.use(bodyParser.json());

// initialise routes
app.use('/energy', path.energy.router);
app.use('/devices', path.devices.router);
app.use('/versions', path.versions.router);
app.use('/devtest', path.devtest.router);

// handle error
app.use(function(err,req, res, next){
    console.log('Unexpected' + err);
    res.status(500).send(err);
});

// [END setup]-------------------------------


// listen for requests---------------------------
if (module === require.main) {

    const PORT = process.env.PORT || 8080;

    app.listen(PORT, () => {
        console.log(`App listening on port ${PORT}`);
        console.log('Press Ctrl+C to quit.');
    });
}
// --------------------------------------------

