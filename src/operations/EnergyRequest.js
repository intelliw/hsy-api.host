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
    constructor(reqPath, reqQuery, reqBody, reqAccepts) {

        // validate and default request parameters and headers 
        let energy = new Param('energy', reqPath.energy, enums.energy.default, enums.energy);       // Param constructor is name, value, default, enum
        let period = new Param.Period(reqPath.period, reqPath.epoch, reqPath.duration);
        let site = new Param('site', reqQuery.site, consts.DEFAULT_SITE);

        // super constructor 
        let params = [energy, period, site];
        super(reqAccepts, params);                                                                  // sets accepts header and checks if params valid

    }

    // perform the energy data operation
    execute() {

        let links;
        let items;
        let collections = new Collections();                                                        // the collections array will store an array of collections, one for  each period in the duration 

        // call super
        super.execute();

        // get a collection for each period in the duration
        let periods = this.params.period.getEach();                                                 // break up the period duration into individual periods
        periods.forEach(period => {

            // create the collection links  
            links = new Links.EnergyLinks(this.params.energy, period, this.params.site);            // this creates the 'self' and 'Collection' links
            links.addLink(period.getGrandchild(), enums.linkRender.none);                           // add the other links needed for the collection
            links.addLink(period.getParent(), enums.linkRender.link);
            links.addLink(period.getNext(), enums.linkRender.link);
            links.addLink(period.getPrev(), enums.linkRender.link);

            items = getItems(this.params.energy, period, this.params.site);

            // add each collection to the collections array
            collections.add(consts.CURRENT_VERSION, links.href, links, items);

        });

        // create a response - the view is named by convention as energy_<contentType enum key name>
        let contentTypeEnumKey = utils.propertyKeyFromValue(enums.mimeTypes, this.accept);

        let view = `energy_${contentTypeEnumKey}`;                                            // e.g. energy.applicationCollectionJson todo: this should be selected dynamically
        let response = new Response(view, 200, collections.getElements(), this.accept);

        return response;

    }

}

// gets links and data for each child period 
function getItems(energy, period, site) {

    let links; let data; let href;

    let items = new Definitions.Items();

    let periods = period.getEachChild();                        // gets the child periods for this period         

    let MOCK_skip;

    periods.forEach(childPeriod => {                            // this can be upto 1000 if child is instant

        if (childPeriod) {

            // randomly skip if instant - needed to limit periods outputted to suimulate real-life data logging for isntant
            MOCK_skip = childPeriod.value == enums.period.instant ? utils.MOCK_randomSkip() : false;

            if (!MOCK_skip) {                                                           // skips only if instant and no match
                // get data
                data = itemData(energy, childPeriod, site);
                if (data) {

                    // make the item links 
                    let links = new Links.EnergyLinks(energy, childPeriod, site);       // constructor creates a child and grandchild link

                    // add an item to the list
                    items.add(links.href, links, data);
                }
            }
            data = global.undefined;

        }
    });

    return items;
}


// gets energy data for this period. if there is no data returns an empty data object 
function itemData(energy, period, site) {

    const dailyHigh = (20 * 3.6);
    const dailyLow = (3 * 3.6);                                                     // kwh => megajoules

    let dataWrapper = new Definitions.Data();

    let energyNames = energyDataNames(energy);                                        // these are the 6 energy names (e.g. 'store.in')

    const MOCK_skip_SOME = true;
    const MOCK_skip_NONE = false;

    // for each child of the containing collection - provide a single total for each energy type
    let childData = new Definitions.Data();
    let minmax = utils.MOCK_periodMinMax(period, dailyHigh, dailyLow);                // get an adjusted minmax for this period
    //
    energyNames.forEach(energyName => {
        let periodValue = utils.MOCK_randomValues(minmax.min, minmax.max, period.duration, MOCK_skip_NONE)
        childData.add(energyName, periodValue);                                       // e.g. harvest  21.133882
    });
    //
    if (childData._elements.length > 0) {                                             // add the 
        dataWrapper.addNested(period.context, `${period.epoch}/${period.duration}`, childData);
    }

    // grandchild - space delimited data values
    let periodChild = period.getChild();
    if (periodChild) {

        let grandchildData = new Definitions.Data();
        

        minmax = utils.MOCK_periodMinMax(periodChild, dailyHigh, dailyLow);           // get an adjusted minmax for the childperiod
        //
        energyNames.forEach(energyName => {

            let periodValue = utils.MOCK_randomValues(minmax.min, minmax.max, periodChild.duration, MOCK_skip_SOME)
            grandchildData.add(energyName, periodValue);

        });
        // 
        if (grandchildData._elements.length > 0) {
            dataWrapper.addNested(periodChild.context, `${periodChild.epoch}/${periodChild.duration}`, grandchildData);
        }
    }

    return dataWrapper;

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
