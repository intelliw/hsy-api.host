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

        this.collections = [];                // the collecitons array will store an array of collections, one for  each period in the duration 

        // get a collection for each period in the duration
        let periods = period.getEach();                     // break up the period duration into individual periods
        periods.forEach(period => {

            href = periodHref(energy, period, site);

            // top level links
            let links = new Definitions.Links();
            addLink(links, energy, period, site, enums.linkRender.none);                    // 'self' not rendered as a link
            addLink(links, energy, period.getChild(), site, enums.linkRender.none);         // 'child ('collection') not rendered as a link
            addLink(links, energy, period.getParent(), site, enums.linkRender.link);
            addLink(links, energy, period.getNext(), site, enums.linkRender.link);
            addLink(links, energy, period.getPrev(), site, enums.linkRender.link);


            // get items
            items = getItems(energy, period, site);

            // create a collection
            let collection = new Definitions.Collection(consts.CURRENT_VERSION, href, links, items); 

            // add it to the collections
            this.collections.push(collection);

        });

    }

}

// gets linkls and data for each child period 
function getItems(energy, period, site) {
    
    let links; let data; let href;
    
    let items = new Definitions.Items();

    let periods = period.getEachChild();                    // gets the child periods for this collection         
    periods.forEach(childPeriod => {

        // get data
        data = itemData(energy, childPeriod, site);
        if (data) {
            
            // make the links
            let links = new Definitions.Links();
            addLink(links, energy, childPeriod, site, enums.linkRender.link);               // the child period ('self') is rendered 
            addLink(links, energy, childPeriod.getChild(), site, enums.linkRender.none);    // the grandchild - not rendered

            // add an item
            let href = periodHref(energy, childPeriod, site);
            items.add(href, links, data);
        }
        data = global.undefined;
    });

    return items;
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
