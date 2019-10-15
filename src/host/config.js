//@ts-check
'use strict';
/**
 * ./host/config.js
 * configuration settings 
 */
const consts = require('../host/constants');

module.exports.initialise = function (app) {
    
    // express initialisations
    app.set('case sensitive routing', true);
    app.disable('x-powered-by');                                            // disable the 'X-Powered-By →Express' header 
                        
    app.set('view engine', 'ejs');                                          // set engine
    app.set('views', consts.folders.VIEWS);                                 // ejs templates folder

}

// system configuration constants
module.exports.system = {
    MONITORING_PRECISION: 4,                                                // decimal places for float values in monitoring dataset
    BODYPARSER_LIMIT_MB: 1                                                  // max mb for post messages 
}