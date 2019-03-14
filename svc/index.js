/**
 * PACKAGE
 * ./svc/index.js
 * 
 * common services and tools. 
 * modules in this package can only access app and other svc modules.
 */
module.exports = {
    config : require('./config'),
    constant : require('./constant'),
    enum : require('./enum'),
    security : require('./security'),
    util : require('./util')
}