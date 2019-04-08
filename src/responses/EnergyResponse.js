//@ts-check
"use strict";
/**
 * ./responses/EnergyResponse.js
 * creates a response for the /energy path. 
 */
const enums = require('../host/enums');
const utils = require('../host/utils');
const consts = require('../host/constants');

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
  constructor(params, contentType) {

    let content = getContent(params);

    super(RESPONSE_STATUS, contentType, VIEW_PREFIX, content);

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

    items = createItemsObject(params.energy, period, params.site);

    // add each collection to the collections array
    collections.add(consts.CURRENT_VERSION, links.href, links, items);
  });

  return collections.getElements();

}

// returns an items object with href, links and data for each child period 
function createItemsObject(energy, period, site) {

  let links; let itemData; let href;

  let items = new Definitions.Items();

  let periods = period.getEachChild();                        // gets the child periods for this period         

  let MOCK_skip;

  periods.forEach(childPeriod => {                            // this can be upto 1000 if child is instant

    if (childPeriod) {

      // get data
      itemData = createItemDataObject(energy, childPeriod, site);
      if (itemData) {

        // make the item links 
        let itemLinks = new Links.EnergyLinks(energy, childPeriod, site);       // constructor creates a child and grandchild link

        // add an item to the list
        items.add(itemLinks.href, itemLinks, itemData);
      }
      itemData = consts.NONE;

    }
  });

  return items;
}

/*
 * returns a data object with two elements for this child period 
  - an element for the child data and an element for the grandchildren data.  
  if there is no data returns an empty data object 
 */
function createItemDataObject(energy, childPeriod, site) {

  // set daily high-low to 3-20 KwH                                                // kwh => megajoules 
  const dailyHigh = (20 * 3.6);                                                    // dailyHigh =72 MJ 
  const dailyLow = (3 * 3.6);                                                      // dailyLow  =10.8 MJ 

  const SPACE_DELIMITER = ' ';

  let dataWrapper = new Definitions.Data();

  let energyNames = energyDataNames(energy);                                        // these are the 6 energy names (e.g. 'store.in')

  let childData = new Definitions.Data();
  let childMinMax = utils.MOCK_periodMinMax(childPeriod, dailyHigh, dailyLow);      // get an adjusted minmax for the childperiod

  let grandChildData = new Definitions.Data();

  let grandChildPeriod = childPeriod.getChild();

  let p; let randomNum; let energyNameValues; let energyNameTotal; let grandChildMinMax; 

  // grandchild - create data for grandchild and child
  energyNames.forEach(energyName => {

    // create space delimited value list 
    energyNameValues = '';
    energyNameTotal = 0;

    if (grandChildPeriod) {

      grandChildMinMax = utils.MOCK_periodMinMax(grandChildPeriod, dailyHigh, dailyLow);        // get an adjusted minmax for the childperiod

      // for each energy type.. harvest, store.in etc
      for (p = 1; p <= grandChildPeriod.duration; p++) {

        // get the number 
        randomNum = utils.randomFloat(grandChildMinMax.min, grandChildMinMax.max, grandChildMinMax.precision);      // get a random number

        // ..add it to the total 
        energyNameTotal = energyNameTotal + parseFloat(randomNum);                              // keep a total for the child period to use with this energy type

        // ..add it to the space-delimited list  
        energyNameValues = p == 1 ? '' : energyNameValues + SPACE_DELIMITER;                    // pad a space after the 1st iteration
        energyNameValues = energyNameValues + randomNum.toString();
      }

      // add the data for this energyName for both child and grandchild  
      if (energyNameValues !== '') {
        childData.add(energyName, energyNameTotal.toFixed(childMinMax.precision).toString());                                  // child has the total
        grandChildData.add(energyName, energyNameValues);                                       // grandchild has the SSV values
      }

    // if there was no grandchild for this period - create data for child only  
    } else {
      
      randomNum = utils.randomFloat(childMinMax.min, childMinMax.max,childMinMax.precision);    // get a random number
      childData.add(energyName, randomNum.toString());                                          

    }

  });


  // add the nested child and grandchild data items to the wrapper 
  if (childData._elements.length > 0) {
    dataWrapper.addNested(childPeriod.context, `${childPeriod.epoch}/${childPeriod.duration}`, childData);
  }

  if (grandChildData._elements.length > 0) {
    dataWrapper.addNested(grandChildPeriod.context, `${grandChildPeriod.epoch}/${grandChildPeriod.duration}`, grandChildData);
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

