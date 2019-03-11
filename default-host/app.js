/**
 * version 00.08
 */

// [START app]
'use strict';

// [START setup] ----------------------------------------------------------------
const express = require('express');
const Buffer = require('safe-buffer').Buffer;
const app = express();

require('./src/config')(app, __dirname);        // configs    
require('./src/route')(app);                    // routes
require('./src/security')(app);                 // security
require('./src/model')(app);                    // model
require('./src/template')(app);                 // template


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
