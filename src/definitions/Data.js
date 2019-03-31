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

    // single level 
    add(name, value) {

        super.add({ "name": name, "value": value });

    }

    // two-tiered - adds a nested Data object
    addNested(name, value, itemData) {

        let data = itemData.getElements();          
        super.add({ "name": name, "value": value, "data": data });

    }

}


module.exports = Data;
