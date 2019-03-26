//@ts-check
"use strict";
/**
 * ./definitions/Collection.js
 *  generic data object for storing an object array
 */

// stores all the elements of a json collection:
class Collection {
    constructor(version, href, colLinks, colItems) {

        let links = colLinks.getElements();             // need getElements so that the _elements does not appear in the output JSON
        let items = colItems.getElements();
        
        this.collection = { href, version, links, items };
    }

}
module.exports = Collection;
