/**
 * version 00.08
 */

'use strict';

const express = require('express');
const bodyParser = require('body-parser')
const Buffer = require('safe-buffer').Buffer;

const host = require('./src/host');                 // common services
const paths = require('./src/paths');
const sandbox = require('./sandbox');

// [START setup]------------------------------
const app = express();

// initialise 
host.config.initialise(app);                                                            // configuration settings


/* body parser
 * use  verify function to get raw body - bodyParser.raw applies only if bodyParser.json fails due to incorrect content-type header
 * this allows us to check if body is empty when validating the content-type header in ContentType constructor   */
var rawBodySaver = function (req, res, buf, encoding) {
    // if (buf && buf.length) { req.rawBody = buf.toString(encoding || 'utf8');}
}
app.use(bodyParser.json({ verify: rawBodySaver, limit: '5mb' }));
app.use(bodyParser.raw({ verify: rawBodySaver, limit: '5mb', type: function () { return true } }));   // for raw body parse function must return true

// routes        
app.use('/energy', paths.energyRouter);                                                 // openapi tag: Energy - this is als to the default route
app.use(['/devices', '/device'], paths.devicesRouter);                                  // openapi tag: Devices
app.use('/api', paths.diagnosticsRouter);                                               // openapi tag: Diagnostics
app.use('/devtest', sandbox.devtest);                                                   // not in openapi spec: for testing and troubleshooting only

// static folders 
app.use('/static', express.static(host.constants.folders.STATIC));


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

