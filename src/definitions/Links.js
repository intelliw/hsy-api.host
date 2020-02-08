//@ts-check
"use strict";
/**
 * ./definitions/Links.js
 *  object for storing Links elements for a JSON collection 
 */

// stores data rows for a json collection  
const enums = require('../environment/enums');

const Definitions = require('./Definitions');
class Links extends Definitions {

    constructor() {

        super();

    }

    // adds a collection json link structure - see https://www.iana.org/assignments/link-relations/link-relations.xhtml
    add(rel, name, prompt, title, description, href, render) {


        // add with or without render (some links do not declare a render attribute)     
        let link = { "rel": rel, "name": name, "prompt": prompt, "title": title, "description": description, "href": href, "render": render };
        
        super.add(link);

    }


}



module.exports = Links;
module.exports.EnergyLinks = require('./EnergyLinks');;
