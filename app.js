/**
 * version 00.08
 */

'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const Buffer = require('safe-buffer').Buffer;

const host = require('./src/host');                 // common services
const sandbox = require('./sandbox');

const paths = require('./src/paths');                

// [START setup]------------------------------

host.config.initialise(app);                        // configuration settings

app.use(bodyParser.json());

// initialise routes - each tag has a route handler
app.use('/energy', paths.energyRouter);           // openapi tag: Energy 
app.use(['/devices', '/device'], paths.devicesRouter);         // openapi tag: Devices
app.use('/api', paths.diagnosticsRouter);         // openapi tag: Diagnostics

// for testing and troubleshooting only
app.use('/devtest', sandbox.devtest);

// handle error
app.use((err, req, res, next) => {
    console.log('Unexpected ' + err);
    res.status(500).json(err);
});

// [END setup]-------------------------------


// listen for requests---------------------------
if (module === require.main) {

    const PORT = process.env.PORT || 8080;

    app.listen(PORT, () => {
        console.log(`App listening (inside container) on port ${PORT}`);
        console.log('Press Ctrl+C to quit.');
    });
}
// --------------------------------------------

