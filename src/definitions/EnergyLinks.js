//@ts-check
"use strict";
/**
 * ./definitions/EnergyLinks.js
 *  object for storing Link elements for Energy path in a JSON collection 
 */

// stores data rows for a json collection  
const enums = require('../environment/enums');
const consts = require('../host/constants');
const env = require('../environment');

const Links = require('./Links');
class EnergyLinks extends Links {

    constructor(energy, period, site, description) {                                    // the description argument is for the self link. 

        super();

        this.energy = energy;                                                           // store energy and site in the object for addLink when links are added for more periods
        this.site = site;
        
        this.href = periodHref(energy, period, site);                                   // this href is used for the whole collection 

        // the self link is needed for both collections and items - add others after construction if needed e.g. for collections
        this.addLink(period, enums.linkRender.link, description);                       // self - is rendered, and a description if requested eg hsy 

    }

    // adds a link if the period exist. duration is optional, if present use it instead of the period's duration
    addLink(period, render, description, duration) {

        if (period) {
            let href = periodHref(this.energy, period, this.site, duration);
            super.add(period.rel, period.context, period.prompt, period.title, description, href, render);
        }
    }

    // adds a metadata link for the energy data periods 
    // adds a service description ('service-meta') metadata link, the 'description' attribute contains JSON metadata
    addPeriodMetadata(period, child, grandchild) {

        // construct metadata content
        let meta = periodMeta(period);
        if (child) meta.child = periodMeta(child);
        if (grandchild) meta.grandchild = periodMeta(grandchild);

        // add the link
        super.add(
            enums.linkRelations.meta,       // rel, 
            period.name,                    // name
            consts.NONE,                    // prompt
            consts.NONE,                    // title
            meta,                           // description - contains child and grandchild
            consts.links.energyDocs,        // href
            enums.linkRender.none           // render
        );

    }


}

// creates href for the energy resource path. 
function periodHref(energy, period, site, duration) {
    
    duration = duration ? duration : period.duration;

    let href = `${env.active.api.scheme}://${env.active.api.host}/energy/${energy.value}/period/${period.value}/${period.epoch}/${duration}?site=${site.value}`;

    return href;

}
// creates metadata for the energy data period. 
function periodMeta(period) {
    
    let meta = {}
    
    if (period) {
        meta = {
            name: period.value,
            epochInstant: period.epochInstant,
            endInstant: period.endInstant,
            duration: period.duration
        }
    }

    return meta;

}

module.exports = EnergyLinks;
