/**
 * ./svc/config.js
 * 
 * configuration and initialisation functions
 */
const svc = require('../svc');

// application initialisation 
module.exports.setup = function (app) {

    // ESJ ------------------------------------------------------------------------
    app.set('view engine', 'ejs');                        // set engine
    app.set('views', svc.constant.folder.VIEWS);   // ejs templates folder

}

