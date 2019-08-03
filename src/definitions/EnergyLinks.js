//@ts-check
"use strict";
/**
 * ./definitions/EnergyLinks.js
 *  object for storing Link elements for Energy path in a JSON collection 
 */

// stores data rows for a json collection  
const enums = require('../host/enums');
const consts = require('../host/constants');

const Links = require('./Links');
class EnergyLinks extends Links {

    constructor(energy, period, site, description) {                                    // the description argument is for the self link. 

        super();

        this.energy = energy;                                                           // store energy and site in the object for addLink when links are added for more periods
        this.site = site;

        this.href = periodHref(energy, period, site);                                   // this href is used for the whole collection 
        
        // the self link is needed for both collections and items - add others after construction if needed e.g. for collections
        this.addLink(period, enums.linkRender.link, description);                     // self - is rendered, and a description if requested eg hse 
        
    }

    // adds a link if the period exist
    addLink(period, render, description) {
        
        if (period) {
            let href = periodHref(this.energy, period, this.site);
            super.add(period.rel, period.context, period.prompt, period.title, description, href, render);
        }
    }

}

// creates href for the energy resource path (
function periodHref(energy, period, site) {

    let href = `${consts.api.scheme}://${consts.environments[consts.env].api.host}/energy/${energy.value}/period/${period.value}/${period.epoch}/${period.duration}?site=${site.value}`;

    return href;

};

module.exports = EnergyLinks;
