// config/index.js
/**
 * intialises configs  
 */
module.exports = function (app, appRoot) {

    const bodyParser = require('body-parser');
    const path = require('path');

    const VIEWS_FOLDER = './src/template';

    // app -----------------------------------------------------------------------
    app.set('case sensitive routing', true);
    app.use(bodyParser.json());

    // ESJ -----------------------------------------------------------------------
    app.set('view engine', 'ejs');                        // set engine
    app.set('views', path.join(appRoot, VIEWS_FOLDER));   // ejs templates folder

}