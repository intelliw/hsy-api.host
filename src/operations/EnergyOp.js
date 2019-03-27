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
const Collection = require('../definitions/Collection');
const Response = require('../responses');

const Op = require('./Op');

/**
 * creates collections with data and stores the data and status in a Response object
 */
class EnergyOp extends Op{

    //  energy period and site are all Param objects. headers is the reqest headers
    constructor(energy, period, site, requestHeaders) {
        
        super();

        // perform the operation
        let collections = [];                // the collections array will store an array of collections, one for  each period in the duration 
        let links; let items; let collection;
        // ..
        // get a collection for each period in the duration
        let periods = period.getEach();                     // break up the period duration into individual periods
        periods.forEach(period => {

            // create links and items 
            links = new Definitions.Links.EnergyLinks(energy, period, site, enums.linksType.collection);
            items = getItems(energy, period, site);

            // create a collection
            collection = new Collection(consts.CURRENT_VERSION, links.href, links, items);

            // add each collection to the collections array
            collections.push(collection);

        });

        // create a response
        let view = 'collections';                                               // todo: this should be selected dynamically
        let headers = new Response.Headers(requestHeaders);                     // the accepts headers should be used to decide on the view
        this.response = new Response(view, 200, collections, headers);

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

            // make the item links
            let links = new Definitions.Links.EnergyLinks(energy, childPeriod, site, enums.linksType.items);

            // add an item
            items.add(links.href, links, data);
        }
        data = global.undefined;
    });

    return items;
}


// gets energy data for this period and site. if ther eis no data retuirns nothing 
function itemData(energy, period, site) {

    let data = new Definitions.Data();

    let dailyHigh = (20 * 3.6); let dailyLow = (3 * 3.6);     // kwh => megajoules

    let dataNames = energyDataNames(energy);    // these are prefixes (e.g. 'store.in') which will be prepended to the period context e.g. store.in.day

    let minmax = MOCK_periodMinMax(period, dailyHigh, dailyLow);                    // get an adjusted minmax for this period
    
    dataNames.forEach(dataName => {
        let periodValue = MOCK_randomValues(minmax.min, minmax.max, period.duration)
        data.add(`${dataName}.${period.context}`, periodValue);
    });

    let periodChild = period.getChild();
    minmax = MOCK_periodMinMax(periodChild, dailyHigh, dailyLow);                   // get an adjusted minmax for the childperiod
    
    if (periodChild) {
        dataNames.forEach(dataName => {
            let periodValue = MOCK_randomValues(minmax.min, minmax.max, periodChild.duration)
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

// returns a min and max value for the average energy consumed in this period
function MOCK_periodMinMax(period, dailyHigh, dailyLow) {

    let minmax = { min: dailyHigh, max: dailyLow };
    let multiplier = 1;

    switch (period.value) {
        case enums.period.instant:
            multiplier = 0.0000000116;
            break;
        case enums.period.second:
            multiplier = 0.0000115741;
            break;
        case enums.period.minute:
            multiplier = 0.0006944444;
            break;
        case enums.period.hour:
            multiplier = 0.0416666667;
            break;
        case enums.period.timeofday:
            multiplier = 0.2500000000;
            break;
        case enums.period.week:
            multiplier = 7.0000000000;
            break;
        case enums.period.month:
            multiplier = 31.0000000000;
            break;
        case enums.period.quarter:
            multiplier = 124.0000000000;
            break;
        case enums.period.year:
            multiplier = 365.0000000000;
            break;
        case enums.period.fiveyear:
            multiplier = 1825.0000000000;
            break;
        case enums.period.day:
        default:
            multiplier = 1.000;
            break;
    }
    minmax.min = dailyLow * multiplier;
    minmax.max = dailyHigh * multiplier;

    return minmax;
}


// returns a space delimited list containing as many values as the duration
function MOCK_randomValues(min, max, duration) {

    const precision = 1000000;         // 3 decimals
    min = min * precision;          // adjust before dividing for decimal place
    max = max * precision;

    let p; let randomNum; let values;

    for (p = 1; p <= duration; p++) {
        randomNum = (Math.floor(Math.random() * max) + min) / precision;

        values = p == 1 ? '' : values + ' ';        // pad a space after the 1st iteration
        values = values + randomNum.toString();
    }

    return values;

}

module.exports = EnergyOp;
