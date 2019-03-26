//@ts-check
"use strict";
/**
 * ./operations/EnergyOp.js
 * prepares data and response for the energy path 
 *  
 */
const enums = require('../system/enums');
const consts = require('../system/constants');

const Definitions = require('../definitions');
const Param = require('../parameters');
const Period = require('../parameters/Period');

/**
 * creates collections with data and stores them in a Definitions object
 */
class EnergyOp {

    //  parameters are all; Param objects
    constructor(energy, period, site) {

        let links; let items; let collection; let href;

        let collections = new Definitions();   // the definitions object will store an array of collections 

        // get a collection for each period in the duration
        let periods = period.getEach();                     // break up the period duration into individual periods
        periods.forEach(period => {

            // get the top level links and the items
            links = getLinks(energy, period, site);
            items = getItems(energy, period, site);

            // create a collection
            href = periodHref(energy, period, site);
            let collection = new Definitions.Collection(consts.CURRENT_VERSION, href, links, items); 

            // add it to the collections
            collections.add(collection);

        });

        this.collections = collections.getElements();
    }

}
// gets the top level links for the whole collection (self, collection, up, next, prev)  
function getLinks(energy, period, site) {

    let links = new Definitions.Links();

    // self link 
    addLink(links, energy, period, site);                   // 'self' not rendered as a link

    // child (collection)
    addLink(links, energy, period.getChild(), site);        // 'collection' not rendered as a link

    // parent (up) 
    addLink(links, energy, period.getParent(), site, enums.linkRender.link);

    // next
    addLink(links, energy, period.getNext(), site, enums.linkRender.link);

    // previous 
    addLink(links, energy, period.getPrev(), site, enums.linkRender.link);

    return links;
}

// gets linkls and data for each child period 
function getItems(energy, period, site) {
    
    let links; let data; let href;
    
    let items = new Definitions.Items();

    let periods = period.getEachChild();                    // gets the child periods for this collection         
    periods.forEach(period => {

        // get item links and data
        links = itemLinks(energy, period, site);
        data = itemData(energy, period, site);

        // add an item
        let href = periodHref(energy, period, site);
        items.add(href, links, data);
    });

    return items;
}

// gets the links for an item (
function itemLinks(energy, childPeriod, site) {

    let links = new Definitions.Links();

    // self link 
    addLink(links, energy, childPeriod, site, enums.linkRender.link);    // the child period ('self') is rendered 

    // child (collection)
    addLink(links, energy, childPeriod.getChild(), site);               // the grandchild - not rendered

    return links;
}

function itemData(energy, period, site) {

    let data = new Definitions.Data();

    data.add('harvest.day', '15396');
    data.add('store.day', '153226');

    return data;
}

// creates href for the energy resource path (
function periodHref(energy, period, site) {

    // e.g. http:/api.endpoints.sundaya.cloud.goog/energy/hse/periods/week/20190204/1?site=9999) 
    let href = `${consts.API_SCHEME}:/${consts.API_HOST}/energy/${energy.value}/periods/${period.value}/${period.epoch}/${period.duration}?site=${site.value}`;

    return href;

}

// adds a link if the period exist
function addLink(links, energy, period, site, render) {

    if (period) {
        let href = periodHref(energy, period, site);
        links.add(period.context, period.rel, period.prompt, period.title, href, render);
    }
}

module.exports = EnergyOp;
