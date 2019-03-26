//@ts-check
"use strict";
/**
 * ./definitions/Items.js
 *  object for storing Items elements for a JSON collection 
 */

// stores data rows for a json collection  
const Definitions = require('./Definitions');

class Items extends Definitions {

    constructor() {

        super();

    }

    add(href, itemLinks, itemData) {

        let links = itemLinks.getElements();        // need getElements so that the _elements does not appear in the output JSON
        let data = itemData.getElements();          

        super.add({ "href": href, "links": links, "data": data });

    }
}

module.exports = Items;
