//@ts-check
"use strict";
/**
 * ./definitions/Data.js
 *  object for storing Data elements for a JSON collection 
 */

// stores data rows for a json collection  
const Definitions = require('./Definitions');

class Data extends Definitions {

    constructor() {

        super();

    }

    add(name, value) {

        super.add({ "name": name, "value": value });

    }

}


module.exports = Data;
