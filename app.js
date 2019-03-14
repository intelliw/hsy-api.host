/**
 * version 00.08
 */

'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let Buffer = require('safe-buffer').Buffer;

let app = express();

let svc = require('./svc');           // common services
let api = require('./api');           // routes

// [START setup]------------------------------

app.set('case sensitive routing', true);
app.use(bodyParser.json());

svc.config.setup(app);                // initialise
api.route.start(app);                 // start the app

// [END setup]-------------------------------


// LISTEN ------------------------------------

if (module === require.main) {

    const PORT = process.env.PORT || 8080;

    app.listen(PORT, () => {
        console.log(`App listening on port ${PORT}`);
        console.log('Press Ctrl+C to quit.');
    });
}
// --------------------------------------------

