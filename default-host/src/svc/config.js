/**
 * ./src/svc/const.folder.js
 * 
 * global constants
 */

module.exports.initialise = function (app, appRoot) {

    const bodyParser = require('body-parser');
    const path = require('path');

    const constants = require('./const');
    
    // app ------------------------------------------------------------------------
    app.set('case sensitive routing', true);
    app.use(bodyParser.json());

    // ESJ ------------------------------------------------------------------------
    app.set('view engine', 'ejs');                        // set engine
    app.set('views', path.join(appRoot, constants.folder.VIEWS));   // ejs templates folder

}


