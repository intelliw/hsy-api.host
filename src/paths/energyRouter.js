//@ts-check
"use strict";
/**
 * ./paths/EnergyGet.js
 * prepares data and response for the energy path 
 */

const env = require('../environment');

const enums = env.enums;
const utils = require('../environment/utils');
const consts = require('../host/constants');
const log = require('../logger').log;

const express = require('express');
const router = express.Router();

const Request = require('./Request');
const Param = require('../parameters');

const Response = require('./Response');
const Collections = require('../definitions/Collections');
const Links = require('../definitions/Links');
const Definitions = require('../definitions');

// REQUEST constants 
const VIEW_PREFIX = 'energy_';
const RESPONSE_STATUS = enums.responseStatus[200];

/*
'/energy' path
create parameter objects for creating the links and collections
energy, site, period -> including next/prev/parent/child periods, with durations
param objects have all the data needed for the 
[energy.period.epoch.duration.get]
 */
router.route([
    '/:energy?',
    '/:energy?/period/:period?',
    '/:energy?/period/:period?/:epoch?/:duration?'])

    .get((req, res, next) => {
        
        // request ---------------------
        let request = new EnergyGet(req);
        
        //  execute if valid
        let response = request.response;                       // execute the operation and return a response 
        let collections = response.content;
        
        // /* response
        res
            .status(response.statusCode)
            .type(response.contentType)
            .render(response.view, {                            // all responses are rendered into an ejs view, including e.g. energy_textHtml, or energy_applicationCollectionJson
                collections: collections, utils: utils, env: env
            });

        /* // debug START
        res
            .status(response.status)
            .type(response.contentType)
            .json({ collections });                             // no need to call .end() as .json calls end
        */ // debug END 

    });


// REQUEST -----------------------------------------------------------------------------------------------------------

/**
 * class EnergyGetRequest validatess parameters and accept headers
 */
class EnergyGet extends Request {

    /**
     * extracts parameters and content type and calls super to validate  
     * if not valid super will create a generic error response
     * if valid this EnergyGetRequest will construct a EnergyGetResponse to produce the response content
    
     instance attributes:  
     super ..
     response : this class sets response only if super does not set it with an error
     
     constructor arguments 
    * @param {*} req                                                    // express req
    */
    constructor(req) {

        const OPTIONAL = true;
        
        // duration  - cap the number of durations for this period
        let duration = parseInt(req.params.duration) || consts.params.defaults.duration;                                     // this handles NaN being passed in as the duration,  
        let period = req.params.period;
        if (utils.valueExistsInObject(enums.params.period, period))  {
            let maxDurationsAllowed = parseInt(consts.period.maxDurationsAllowed[period]);                                   // cap the number of durations for this period
            duration = (Math.abs(duration) > maxDurationsAllowed ? maxDurationsAllowed * Math.sign(duration): duration);     // check if requested duration is negative - for periods retrospective to epoch 
        } 
        // parameters                                                   // validate and default all parameters
        let params = {};
        params.energy = new Param('energy', req.params.energy, enums.params.energy.default, enums.params.energy);
        params.period = new Param.Period(period, req.params.epoch, duration);
        params.site = new Param('site', req.query.site, consts.params.defaults.site);
        params.productCatalogItems = new Param('productCatalogItems', req.body.productCatalogItems, consts.NONE, consts.NONE, OPTIONAL);

        // super - validate params, auth, accept header
        super(req, params, EnergyGetResponse.produces, EnergyGetResponse.consumes);                 // super validates and sets this.accepts this.isValid, this.isAuthorised params valid

        // trace log the request
        log.trace(log.enums.labels.requestStatus, `energy GET ${this.accept.value}, sender:${Param.ApiKey.getSender(this.apiKey.value)}, valid?${this.validation.isValid}`, JSON.stringify({params: params}));

        // execute the response only if super isValid                   // if not isValid  super constuctor would have created a this.response = ErrorResponse 
        this.response = this.validation.isValid === true ? new EnergyGetResponse(this.params, this.accept) : this.response;

    }

}

// RESPONSE -----------------------------------------------------------------------------------------------------------

class EnergyGetResponse extends Response {

    /**
    * creates energy data collections and stores cotnent and status in a Response object
    */
    constructor(params, reqAcceptParam) {
  
      // [start trace] -------------------------------  
      const sp = log.TRACE.createChildSpan({ name: `${log.enums.methods.energyExecuteGet}` });
  
      // perform the energy data retrieval operation 
      let content = executeGet(params);                                             
  
      // [end trace] ---------------------------------  
      sp.endSpan();
  
      super(RESPONSE_STATUS, reqAcceptParam, VIEW_PREFIX, content);
  
    }
  
    
  /**
    * a list of mimetypes which this responder's request (EnergyGetRequest) is able to support. 
    * the default mimetype must be the first item
    * this list must match the list specified in the 'produces' property in the openapi spec
    */
   static get produces() { return [enums.mimeType.applicationCollectionJson, enums.mimeType.applicationJson, enums.mimeType.textHtml, enums.mimeType.textPlain] };
   static get consumes() { return [enums.mimeType.applicationJson] };
  
  }
  
  // perform the energy data operation and return a collections array
  function executeGet(params) {
  
    let links;
    let items;
    let collections = new Collections();                                            // stores an array of collections, one for each period in the duration 
  
    let child;
    let grandchild;
  
    // get a collection for each period in the duration
    let periods = params.period.getEach();                                          // break up the period duration into individual periods (though typically there is only 1 period) 
    periods.forEach(period => {
  
      // create the collection links  
      let selfDescription = `${params.energy.value} ${period.value} ${period.epoch} ${period.duration} ${params.site.value}`;    // e.g hsy week 20190204 1 999   (this is the self description format for energy periods) 
      links = new Links.EnergyLinks(params.energy, period, params.site, selfDescription);   // constructor creates a 'self' link with an energy and epoch description
  
      child = period.getChild();                                                    // create the child link with a period description (if one has been configured for it in consts.period.childDescription)
  
      if (child) {                                                                  // instant does not have a child
        child.addDescription();
  
        links.addLink(child, enums.linkRender.none, child.description);             // child collection link - not rendered, with a period description
        grandchild = child.getChild();
      }
  
      if (grandchild) {                                                             // second for example does not have a grandchild
        grandchild.addDescription();
        links.addLink(grandchild, enums.linkRender.none, grandchild.description);   // create grandchild with a period description
      }
  
      links.addLink(period.getParent(), enums.linkRender.link);
      links.addLink(period.getNext(), enums.linkRender.link);
      links.addLink(period.getPrev(), enums.linkRender.link);
  
      items = createItems(params.energy, period, params.site);
  
      // add each collection to the collections array
      collections.add(env.active.api.versions.current, links.href, links, items);
    });
  
    return collections.getElements();
  
  }
  
  // returns an items object with href, links and data for each child period 
  function createItems(energy, period, site) {
  
    let links; let itemData; let href;
  
    let items = new Definitions.Items();
  
    let periods = period.getEachChild();                                            // gets the child periods for this period         
  
    let MOCK_skip;
  
    periods.forEach(childPeriod => {                                                // this can be upto 1000 if child is instant
  
      if (childPeriod) {
  
        let grandchildPeriod = childPeriod.getChild();
  
        // get data
        itemData = createItemData(energy, childPeriod, grandchildPeriod, site);
        if (itemData) {
  
          // make the item links 
          let itemLinks = new Links.EnergyLinks(energy, childPeriod, site, consts.NONE);                // constructor creates a self link (for the child) without a description (NONE)
  
          if (grandchildPeriod) {                                                                       // 'second' for example does not have a grandchild
            itemLinks.addLink(grandchildPeriod, enums.linkRender.none, grandchildPeriod.description);   // child collection link - not rendered, description if requested by caller
          }
  
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
    energy is a param object e.g.
      Param {
      name: 'energy',
      value: 'hsy',
      isOptional: false,
      isValid: 'hsy' }
   */
  function createItemData(energy, childPeriod, grandChildPeriod, site) {
  
    // set daily high-low to 3-20 KwH                                                // kwh => megajoules 
    const dailyHigh = (20 * 3.6);                                                    // dailyHigh =72 MJ 
    const dailyLow = (3 * 3.6);                                                      // dailyLow  =10.8 MJ 
  
    const SPACE_DELIMITER = ' ';
    const FUTURE_UNKNOWN = '0';
  
    let dataWrapper = new Definitions.Data();
    let energyNames = getEnergyDataNames(energy);                                    // these are the 6 energy names (e.g. 'store.in')
  
    let childData = new Definitions.Data();
    let childMinMax = utils.MOCK_periodMinMax(childPeriod, dailyHigh, dailyLow);     // get an adjusted minmax for the childperiod 
  
    let grandChildData = new Definitions.Data();
  
    let p; let randomNum; let energyNameValues; let energyNameTotal; let grandChildMinMax; let isFuture;
  
    // grandchild - create data for grandchild and child
    energyNames.forEach(energyName => {
  
      // create space delimited value list 
      energyNameValues = '';
      energyNameTotal = 0;
  
      if (grandChildPeriod) {
  
        isFuture = grandChildPeriod.isFutureEpoch();                                              // check if this is in the future
        grandChildMinMax = utils.MOCK_periodMinMax(grandChildPeriod, dailyHigh, dailyLow);        // get an adjusted minmax for the childperiod
  
        // for each energy type.. harvest, store.in etc
        for (p = 1; p <= grandChildPeriod.duration; p++) {
  
          // get the number (zero if future) ..add it to the total, and  ..add it to the space-delimited list  
          randomNum = isFuture ? FUTURE_UNKNOWN : utils.randomFloat(grandChildMinMax.min, grandChildMinMax.max, grandChildMinMax.precision);      // get a random number
          energyNameTotal = energyNameTotal + parseFloat(randomNum);                              // keep a total for the child period to use with this energy type
          energyNameValues = p == 1 ? '' : energyNameValues + SPACE_DELIMITER;                    // pad a space after the 1st iteration
          energyNameValues = energyNameValues + randomNum.toString();
  
        }
  
        // add up the values for this energyName for both child and grandchild  
        if (energyNameValues !== '') {
          childData.add(energyName, energyNameTotal.toFixed(childMinMax.precision).toString());                                  // child has the total
          grandChildData.add(energyName, energyNameValues);                                       // grandchild has the SSV values
        }
  
        // if there was no grandchild..
      } else {
  
        // ..create data just for child only  
        randomNum = utils.randomFloat(childMinMax.min, childMinMax.max, childMinMax.precision);    // get a random number
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
  function getEnergyDataNames(energy) {
  
    let names = [];
    switch (energy.value) {
      case enums.params.energy.harvest:
        names.push(enums.energyData.harvest);
        break;
      case enums.params.energy.store:
        names.push(enums.energyData.storein);
        names.push(enums.energyData.storeout);
        break;
      case enums.params.energy.yield:
        names.push(enums.energyData.yield);
        break;
      case enums.params.energy.buy:
        names.push(enums.energyData.buyin);
        names.push(enums.energyData.buyout);
        break;
      case enums.params.energy.hsy:                                           // hsy returns all names               
        names.push(enums.energyData.harvest);
        names.push(enums.energyData.storein);
        names.push(enums.energyData.storeout);
        names.push(enums.energyData.yield);
        names.push(enums.energyData.buyin);
        names.push(enums.energyData.buyout);
        break;
    };
    return names;
  }
  

module.exports = router;


