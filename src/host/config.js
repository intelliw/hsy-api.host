//@ts-check
/**
 * ./svc/config.js
 * configuration settings 
 */
const def = require('../system');           // constants and enums

module.exports.initialise = function (app) {
    
    app.set('case sensitive routing', true);
    app.disable('x-powered-by');                   // disable the 'X-Powered-By →Express' header 

    app.set('view engine', 'ejs');                 // set engine
    app.set('views', def.constants.folders.VIEWS);   // ejs templates folder

}

