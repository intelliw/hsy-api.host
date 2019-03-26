//@ts-check
"use strict";
/**
 * ./definitions/Links.js
 *  object for storing Links elements for a JSON collection 
 */

// stores data rows for a json collection  
const Definitions = require('./Definitions');

class Links extends Definitions {

    constructor() {

        super();

    }

    add(name, rel, prompt, title, href, render) {

        // add with or without render (some links do not declare a render attribute)     
        if (render) {
            super.add({ "rel": rel, "name": name, "prompt": prompt, "title": title, "href": href, "render": render });
        } else {
            super.add({ "rel": rel, "name": name, "prompt": prompt, "title": title, "href": href });
        }

    }
}



module.exports = Links;
