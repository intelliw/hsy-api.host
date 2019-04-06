//@ts-check
"use strict";
/**
 * ./responses/EnergyResponse.js
 * creates a response for the /energy path. 
 */
const enums = require('../system/enums');
const utils = require('../system/utils');
const consts = require('../system/constants');

const Response = require('./Response');
const Collections = require('../definitions/Collections');
const Links = require('../definitions/Links');
const Definitions = require('../definitions');

const VIEW_PREFIX = 'energy_';
const RESPONSE_STATUS = enums.responseStatus[200];

class EnergyResponse extends Response {

  /**
  * creates energy data collections and stores cotnent and status in a Response object
  */
  constructor(reqParams, reqContentType) {

    let content = getContent(reqParams);
    
    super(RESPONSE_STATUS, reqContentType, VIEW_PREFIX, content);

  }

}

// perform the energy data operation and return a collections array
function getContent(params) {

  let links;
  let items;
  let collections = new Collections();                                         // the collections array will store an array of collections, one for  each period in the duration 

  // get a collection for each period in the duration
  let periods = params.period.getEach();                                       // break up the period duration into individual periods
  periods.forEach(period => {

    // create the collection links  
    links = new Links.EnergyLinks(params.energy, period, params.site);         // this creates the 'self' and 'Collection' links
    links.addLink(period.getGrandchild(), enums.linkRender.none);              // add the other links needed for the collection
    links.addLink(period.getParent(), enums.linkRender.link);
    links.addLink(period.getNext(), enums.linkRender.link);
    links.addLink(period.getPrev(), enums.linkRender.link);

    items = getItems(params.energy, period, params.site);

    // add each collection to the collections array
    collections.add(consts.CURRENT_VERSION, links.href, links, items);
  });

  return collections.getElements();

}

// gets links and data for each child period 
function getItems(energy, period, site) {

  let links; let data; let href;

  let items = new Definitions.Items();

  let periods = period.getEachChild();                        // gets the child periods for this period         

  let MOCK_skip;

  periods.forEach(childPeriod => {                            // this can be upto 1000 if child is instant

    if (childPeriod) {

      // randomly skip if instant - to limit output
      MOCK_skip = childPeriod.value == enums.period.instant ? utils.MOCK_randomSkip() : false;

      if (!MOCK_skip) {                                                       // skips only if instant and no match
        // get data
        data = itemData(energy, childPeriod, site);
        if (data) {

          // make the item links 
          let links = new Links.EnergyLinks(energy, childPeriod, site);       // constructor creates a child and grandchild link

          // add an item to the list
          items.add(links.href, links, data);
        }
      }
      data = consts.NONE;

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

  let MOCK_skip;


  // for each child of the containing collection - provide a single total for each energy type
  let childData = new Definitions.Data();
  let minmax = utils.MOCK_periodMinMax(period, dailyHigh, dailyLow);                // get an adjusted minmax for this period
  //
  energyNames.forEach(energyName => {

    let periodValue = utils.MOCK_randomValues(minmax.min, minmax.max, period.duration, false)
    if (periodValue) {
      childData.add(energyName, periodValue);                                       // e.g. harvest  21.133882
    }
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

      // randomly skip if instant - to limit output
      MOCK_skip = periodChild.value == enums.period.instant ? utils.MOCK_randomSkip() : false;

      let periodValue = utils.MOCK_randomValues(minmax.min, minmax.max, periodChild.duration, MOCK_skip)
      if (periodValue) {
        grandchildData.add(energyName, periodValue);
      }

    });
    // 
    if (grandchildData._elements.length > 0) {
      dataWrapper.addNested(periodChild.context, `${periodChild.epoch}/${periodChild.duration}`, grandchildData);
    }
  }

  return dataWrapper;

}

// returns an array of property names for the specified energy argument
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
    case enums.energy.grid:                                          //
      names.push(enums.energyData.gridin);
      names.push(enums.energyData.gridout);
      break;
    case enums.energy.hse:                                           // hse returns all names               
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


module.exports = EnergyResponse;

/**
  * a list of mimetypes which this responder's request (EnergyRequest) is able to support. 
  * the default mimetype must be the first item
  * this list must match the list specified in the 'produces' property in the openapi spec
  */
module.exports.produces = [enums.mimeTypes.applicationCollectionJson, enums.mimeTypes.applicationJson, enums.mimeTypes.textHtml, enums.mimeTypes.textPlain];

