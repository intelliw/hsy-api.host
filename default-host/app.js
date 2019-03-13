/**
 * version 00.08
 */

'use strict';

// SETUP -------------------------------------------------------------------------
const express = require('express');
const Buffer = require('safe-buffer').Buffer;
const app = express();

const svc = require('./src/svc');                       // services
svc.config.initialise(app, __dirname);                  // .. initialise the app

const route = require('./src/route')(app);              // routes
const model = require('./src/model')(app);              // model
const view = require('./src/view')(app);                // templates

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
