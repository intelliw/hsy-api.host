//@ts-check
'use strict';
/**
 * version 00.08
 */

const express = require('express');
const bodyParser = require('body-parser')
const Buffer = require('safe-buffer').Buffer;

const host = require('./src/host');
const consts = host.constants;
const config = require('./src/config');

const paths = require('./src/paths');
const errors = require('./src/common/errors');

// [START setup]------------------------------
const app = express();

// initialise 
config.initialise(app);                                                            // configuration settings

/* body parser
 * use  verify function to get raw body - bodyParser.raw applies only if bodyParser.json fails due to incorrect content-type header
 * this allows us to check if body is empty when validating the content-type header in ContentType constructor   */
var rawBodySaver = function (req, res, buf, encoding) {
    // if (buf && buf.length) { req.rawBody = buf.toString(encoding || 'utf8');}
}
app.use(bodyParser.json({ verify: rawBodySaver, limit: `${consts.system.BODYPARSER_LIMIT_MB}mb` }));
app.use(bodyParser.raw({ verify: rawBodySaver, limit: `${consts.system.BODYPARSER_LIMIT_MB}mb`, type: function () { return true } }));   // for raw body parse function must return true

// routes        
app.use('/energy', paths.energyRouter);                                                 // openapi tag: Energy - this is als to the default route
app.use(['/devices', '/device'], paths.devicesRouter);                                  // openapi tag: Devices
app.use('/api', paths.apiRouter);                                                       // openapi tag: Diagnostics
app.use('/static', express.static(consts.folders.STATIC));                              // static folders 

// error handlers
app.use((err, req, res, next) => {
    errors.reportMessage('Unexpected ' + err);
    res.status(500).json(err);
});
app.get('/error', (req, res, next) => {
    res.send('Something broke!');
    next(errors.reportMessage('Unexpected Error'));
});
app.get('/exception', () => {
    JSON.parse('{"malformedJson": true');
});

// express error handling middleware should be attached after all the other routes and use() calls. See the Express.js docs.  https://cloud.google.com/error-reporting/docs/setup/nodejs
app.use(errors.LOGGER.express);


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

