//@ts-check
"use strict";
/**
 * ./definitions/Definitions.js
 *  generic data object for storing an object array
 */

// stores data rows for a json collection  
class Definitions {
    
    constructor() {

        this._elements = [];         // starts with an empy array

    }

    add(object) {

        this._elements.push(object);

    }

    getElements() {
        return this._elements;
    }
}


module.exports = Definitions;
