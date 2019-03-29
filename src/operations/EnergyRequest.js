//@ts-check
"use strict";
/**
 * ./operations/EnergyRequest.js
 * prepares data and response for the energy path 
 */
const enums = require('../system/enums');
const consts = require('../system/constants');
const utils = require('../system/utils');

const Definitions = require('../definitions');
const Links = require('../definitions/Links');
const Collections = require('../definitions/Collections');
const Response = require('../responses');

const Request = require('./Request');
const Param = require('../parameters');

/**
 * creates collections with data and stores the data and status in a Response object
 */
class EnergyRequest extends Request {

    //  energy period and site are all Param objects. 
    constructor(reqParams, reqQuery, reqBody, reqAccepts) {

        super(reqAccepts);                                      // super selects the mimetype and sets this.accept 

    }

    // perform the energy data operation
    execute() {

        let links;
        let items;
        let collections = new Collections();                    // the collections array will store an array of collections, one for  each period in the duration 

        // call super
        super.execute();

        // validate and default request parameters and headers (Param constructor is name, value, default, enum)
        let energy = new Param('energy', this.reqParams.energy, enums.energy.default, enums.energy);
        let period = new Param.Period(this.reqParams.period, this.reqParams.epoch, this.reqParams.duration);
        let site = new Param('site', this.reqQuery.site, consts.DEFAULT_SITE);
        // console.log(`${energy.value}, ${period.value}, ${period.epochInstant}, ${period.endInstant}, ${period.duration}, ${site.value}, ${this.accept}`);

        // get a collection for each period in the duration
        let periods = period.getEach();                         // break up the period duration into individual periods
        periods.forEach(period => {

            // create the collection links  
            links = new Links.EnergyLinks(energy, period, site);            // this creates the 'self' and 'Collection' links
            links.addLink(period.getParent(), enums.linkRender.link);                   // add the other links needed for the collection
            links.addLink(period.getNext(), enums.linkRender.link);
            links.addLink(period.getPrev(), enums.linkRender.link);


            items = getItems(energy, period, site);

            // add each collection to the collections array
            collections.add(consts.CURRENT_VERSION, links.href, links, items);

        });

        // create a response
        let view = 'collections';                                                       // todo: this should be selected dynamically
        let response = new Response(view, 200, collections.getElements(), this.accept);

        return response;

    }

}

// gets linkls and data for each child period 
function getItems(energy, period, site) {

    let links; let data; let href;

    let items = new Definitions.Items();

    let periods = period.getEachChild();                        // gets the child periods for this collection         

    periods.forEach(childPeriod => {

        if (childPeriod) {

            // get data
            data = itemData(energy, childPeriod, site);
            if (data) {

                // make the item links - child and granchild of the containing collection 
                let links = new Definitions.Links.EnergyLinks(energy, childPeriod, site);

                // add an item to the list
                items.add(links.href, links, data);
            }
            data = global.undefined;

        }
    });

    return items;
}


// gets energy data for this period and site. if there is no data returns an empty data object 
function itemData(energy, period, site) {

    const dailyHigh = (20 * 3.6);
    const dailyLow = (3 * 3.6);                                                     // kwh => megajoules

    let data = new Definitions.Data();


    let dataNames = energyDataNames(energy);                                        // these are prefixes (e.g. 'store.in') which will be prepended to the period context e.g. store.in.day

    let minmax = utils.MOCK_periodMinMax(period, dailyHigh, dailyLow);              // get an adjusted minmax for this period

    // for each child of the containing collection - prvide a single total for each energy type
    dataNames.forEach(dataName => {
        let periodValue = utils.MOCK_randomValues(minmax.min, minmax.max, period.duration)
        data.add(`${dataName}.${period.context}`, periodValue);

    });

    // grandchild - space delimited data values
    let periodChild = period.getChild();
    if (periodChild) {
        minmax = utils.MOCK_periodMinMax(periodChild, dailyHigh, dailyLow);           // get an adjusted minmax for the childperiod

        dataNames.forEach(dataName => {
            let periodValue = utils.MOCK_randomValues(minmax.min, minmax.max, periodChild.duration)
            data.add(`${dataName}.${periodChild.context}`, periodValue);
        });

    }

    return data;

}

// returns an array of item names for the specified energy argument
function energyDataNames(energy) {

    let names = [];
    switch (energy.value) {
        case enums.energy.harvest:
            names.push(enums.energyData.harvest);
            break;
        case enums.energy.store:
            names.push(enums.energyData.storein);
            names.push(enums.energyData.storeout);
            break;
        case enums.energy.enjoy:
            names.push(enums.energyData.enjoy);
            break;
        case enums.energy.grid:
            names.push(enums.energyData.gridin);
            names.push(enums.energyData.gridout);
            break;
        case enums.energy.hse:
            names.push(enums.energyData.harvest);
            names.push(enums.energyData.storein);
            names.push(enums.energyData.storeout);
            names.push(enums.energyData.enjoy);
            names.push(enums.energyData.gridin);
            names.push(enums.energyData.gridout);
            break;
    };
    return names;
}

module.exports = EnergyRequest;
