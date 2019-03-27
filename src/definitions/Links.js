//@ts-check
"use strict";
/**
 * ./definitions/Links.js
 *  object for storing Links elements for a JSON collection 
 */

// stores data rows for a json collection  
const Definitions = require('./Definitions');
const enums = require('../system/enums');

class Links extends Definitions {

    constructor() {

        super();

    }

    add(name, rel, prompt, title, href, render) {


        // add with or without render (some links do not declare a render attribute)     
        let link = { "name": name, "rel": rel, "prompt": prompt, "title": title, "href": href, "render": render };
        
        super.add(link);

    }
}



module.exports = Links;
