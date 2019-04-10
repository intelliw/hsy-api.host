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

    constructor(energy, period, site) {

        super();

        this.energy = energy;                                           // store energy and site in the object for addLink when links are added for more periods
        this.site = site;

        this.href = periodHref(energy, period, site);                   // this href is used for the whole collection 

        // these two links are needed for both collections and for items - add others after construction if needed e.g. for collections
        this.addLink(period,enums.linkRender.link);                     // 'self' is rendered 
        this.addLink(period.getChild(), enums.linkRender.none);         // the child - not rendered

    }

    // adds a link if the period exist
    addLink(period, render) {

        if (period) {
            let href = periodHref(this.energy, period, this.site);
            super.add(period.rel, period.context, period.prompt, period.title, href, render);
        }
    }

}

// creates href for the energy resource path (
function periodHref(energy, period, site) {

    let href = `${consts.API_SCHEME}://${consts.API_HOST}/energy/${energy.value}/period/${period.value}/${period.epoch}/${period.duration}?site=${site.value}`;

    return href;

};

module.exports = EnergyLinks;
