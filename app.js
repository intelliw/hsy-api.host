/**
 * version 00.08
 */

'use strict';

// [START setup]------------------------------

const express = require('express');
const bodyParser = require('body-parser');
const Buffer = require('safe-buffer').Buffer;

const app = express();

app.set('case sensitive routing', true);
app.use(bodyParser.json());

// [END setup]-------------------------------



// load modules and start the api
const svc = require('./svc');               // common services
const api = require('./api');               // start modules for each route
const dto = require('./dto');
const vws = require('./vws');

svc.config.setup(app);                 // .. initialise the app
api.route.start(app);


// LISTEN ------------------------------------

if (module === require.main) {

    const PORT = process.env.PORT || 8080;

    app.listen(PORT, () => {
        console.log(`App listening on port ${PORT}`);
        console.log('Press Ctrl+C to quit.');
    });

}
// --------------------------------------------

