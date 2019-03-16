/**
 * ./svc/config.js
 * configuration and initialisation functions
 */
const svc = require('../svc');

module.exports.setup = function (app) {

    app.set('view engine', 'ejs');                 // set engine
    app.set('views', svc.constant.folder.VIEWS);   // ejs templates folder

}

