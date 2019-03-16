/**
 * ./svc/config.js
 * configuration settings 
 */
const def = require('../definitions');           // constants and enums

module.exports.initialise = function (app) {
    
    app.set('case sensitive routing', true);

    app.set('view engine', 'ejs');                 // set engine
    app.set('views', def.constants.folder.VIEWS);   // ejs templates folder

}

