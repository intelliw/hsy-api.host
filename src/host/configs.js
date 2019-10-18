//@ts-check
'use strict';
/**
 * ./config/configs.js
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

