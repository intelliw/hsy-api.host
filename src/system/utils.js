//@ts-check
/**
 * PACKAGE: ./system/index.js
 * schemas and constants
 */

const enums = require('./enums');

module.exports.capitalise = (str) => {return str.charAt(0).toUpperCase() + str.slice(1)};       // capitalise first letter

