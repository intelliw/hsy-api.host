//@ts-check
"use strict";
/**
 * ./parameters/Dataset.js
 * A dataset object posted through a request path. 
 * each dataset object contains a device identifier and topic header, and a data array with a eventTime header
 * [ {{ "device": "BBC-PR1202-999",
        "topic": "MPPTSNMP",
        "dataset": [
          { "eventTime": "20190209T150006.022-0700",
            "data": [            
              { "name": "pv1", "value": "99" },
              ..} ]
 */
const moment = require('moment');

const enums = require('../host/enums');
const consts = require('../host/constants');
const utils = require('../host/utils');

const Param = require('./Param');
const MILLISECOND_FORMAT = consts.periodDatetimeISO.instant;                                    // the default format, YYYYMMDDTHHmmss.SSS
const THIS_PARAM_NAME = 'dataset';

/**
 * 
 */
class Dataset extends Param {
  /**
  instance attributes:  
   super.name: "dataset"
   super.value: (datasetTopic) e.g. pms-epack  
   super.isValid: true
  
   key = (datasetKey) e.g. BBC-PMS-999
   items = [{ "eventTime": "20190209T150006.032-0700" , "data": [{ },{ }..] }, ..]   
   
   constructor arguments  
  * @param {*} deviceDatasets
  */
  constructor(datasetKey, datasetTopic, datasetItems) {

    super(THIS_PARAM_NAME, datasetTopic, consts.NONE, enums.messageBroker.topics);
    
    this.key = datasetKey;
    this.items = datasetItems;
  }

}

module.exports = Dataset;
