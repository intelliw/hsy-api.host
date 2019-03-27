//@ts-check
"use strict";
/**
 * ./definitions/Collection.js
 *  generic JSON collection object 
 */
const Definitions = require('./Definitions');

// stores all the elements of a json collection:
class Collections extends Definitions  {
    constructor() {
        super();
    }

    add(version, href, colLinks, colItems) {

        let links = colLinks.getElements();             // need getElements so that the _elements does not appear in the output JSON
        let items = colItems.getElements();
        
        let collection = { "collection" : { "href": href, "version": version, links, items } };

        
        super.add(collection);

    }
}
module.exports = Collections;
