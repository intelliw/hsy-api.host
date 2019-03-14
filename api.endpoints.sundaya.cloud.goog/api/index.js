/**
 * PACKAGE
 * ./api/index.js
 * 
 * implementations for each route. 
 * modules can access svc and app but cannot access other api modules
 */

module.exports.route = require('./route')
module.exports.model = require('./model');
module.exports.view = require('./view');
module.exports.validate = require('./validate');


