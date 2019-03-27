//@ts-check
"use strict";
/**
 * ./definitions/EnergyLinks.js
 *  object for storing Link elements for Energy path in a JSON collection 
 */

// stores data rows for a json collection  
const Links = require('./Links');
const enums = require('../system/enums');
const consts = require('../system/constants');

class EnergyLinks extends Links {

    constructor(energy, period, site, linksType) {

        super();
        
        this.href = periodHref(energy, period, site);
        
        // top level links
        if (linksType == enums.linksType.collection) {
            
            this.addLink(energy, period, site, enums.linkRender.none);                    // 'self' not rendered as a link
            this.addLink(energy, period.getChild(), site, enums.linkRender.none);         // 'child ('collection') not rendered as a link
            this.addLink(energy, period.getParent(), site, enums.linkRender.link);
            this.addLink(energy, period.getNext(), site, enums.linkRender.link);
            this.addLink(energy, period.getPrev(), site, enums.linkRender.link);
            
            // item links
        } else if (linksType == enums.linksType.items) {
            
            this.addLink(energy, period, site, enums.linkRender.link);                  // the child period ('self') is rendered 
            this.addLink(energy, period.getChild(), site, enums.linkRender.none);       // the grandchild - not rendered

        }

    }


    // adds a link if the period exist
    addLink(energy, period, site, render) {

        if (period) {
            let href = periodHref(energy, period, site);                                     
            super.add(period.rel, period.context, period.prompt, period.title, href, render);
        }
    }


}

// creates href for the energy resource path (
function periodHref(energy, period, site) {

    let href = `${consts.API_SCHEME}://${consts.API_HOST}/energy/${energy.value}/periods/${period.value}/${period.epoch}/${period.duration}?site=${site.value}`;

    return href;

};

module.exports = EnergyLinks;
