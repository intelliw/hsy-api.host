//@ts-check
'use strict';
/**
 * ./producers/MonitoringMppt.js
 *  base type for Kafka message producers  
 */
const ActiveMsgProducer = require('../producers').ActiveMsgProducer;

const consts = require('../host/constants');

const env = require('../environment/env');
const enums = require('../environment/enums');
const utils = require('../environment/utils');
const log = require('../logger').log;

const moment = require('moment');

const API_PATH_IDENTIFIER = enums.params.datasets.mppt;
const WRITE_TOPIC = env.active.messagebroker.topics.monitoring.mppt;

/**
 * instance attributes
 * producer                                                             //  e.g. Dataset - producer object responsible for transforming a consumed message and if requested, sending it to a new topic  
 constructor arguments 
 */
class MonitoringMppt extends ActiveMsgProducer {

    /**
     * instance attributes:  
     * apiPathIdentifier                                                            // enums.params.datasets
     * writeTopic                                                                   // env.active.messagebroker.topics.monitoring
     * constructor arguments 
     * @param {*}                                                                   
     */
    constructor() {

        super(API_PATH_IDENTIFIER, WRITE_TOPIC);

    }

    /**
     * creates an array of messagebroker messages and returns them in a results object
     */
    _extractData(datasets, sender) {

        let key
        let dataItemCount = 0;
        let volts, amps, watts;
        let attrArray;

        const PRECISION = consts.system.MONITORING_PRECISION;

        let msgObj = { itemCount: 0, messages: [] };

        // extract and add messages to results 
        datasets.forEach(dataset => {                                                           

            key = dataset.mppt.id;                                                               

            // add each data item in the dataset as an individual message
            dataset.data.forEach(dataItem => {                                                  // e.g. "data": [ { "time_local": "2

                //  reconstruct dataitem - add new attributes and flatten arrays 
                let dataObj = {
                    mppt_id: key,
                    time_local: dataItem.time_local                                                         // this gets replaced and deleted in addGenericAttributes()
                }

                // pv
                attrArray = [];
                for (let i = 1; i <= dataItem.pv.volts.length; i++) {
                    volts = dataItem.pv.volts[i - 1];
                    amps = dataItem.pv.amps[i - 1];
                    watts = (volts * amps).toFixed(PRECISION);

                    attrArray.push({ volts: volts, amps: amps, watts: parseFloat(watts) });
                };
                dataObj.pv = attrArray;                                                                     // "pv": [ {"volts": 48, "amps": 6, "watts": 288 },

                // battery
                volts = dataItem.battery.volts;
                amps = dataItem.battery.amps;
                watts = (volts * amps).toFixed(PRECISION);

                dataObj.battery = {                                                                         //   "battery": {
                    volts: volts, amps: amps, watts: parseFloat(watts)                                      //      "volts": 55.1, "amps": 0.0, "watts": 0 },
                }

                // load
                attrArray = [];
                for (let i = 1; i <= dataItem.load.volts.length; i++) {
                    volts = dataItem.load.volts[i - 1];
                    amps = dataItem.load.amps[i - 1];
                    watts = (volts * amps).toFixed(PRECISION);

                    attrArray.push({ volts: volts, amps: amps, watts: parseFloat(watts) });
                };
                dataObj.load = attrArray;                                                                   // "load": [ {"volts": 48, "amps": 6, "watts": 288 },

                // status
                let statusBits = utils.hex2bitArray(dataItem.status, consts.equStatus.BIT_LENGTH);                              // get a reversed array of bits (bit 0 is least significant bit)

                dataObj.status = {
                    bus_connect: utils.tristateBoolean(statusBits[0], false, true),                                             // bit 0    "status": { "bus_connect": true }, 
                    input: consts.equStatus.mppt.input[consts.equStatus.ENUM_PREFIX + statusBits[1] + statusBits[2]],           // bit 1,2              "input": "normal"
                    chgfet: utils.tristateBoolean(statusBits[3], "ok", "short"),                                                              // bit 3                "chgfet": true, 
                    chgfet_antirev: utils.tristateBoolean(statusBits[4], "ok", "short"),                                                      // bit 4                "chgfet_antirev": true, 
                    fet_antirev: utils.tristateBoolean(statusBits[5], "ok", "short"),                                                         // bit 5                "fet_antirev": true,   
                    input_current: utils.tristateBoolean(statusBits[6], "ok", "overcurrent"),                                                       // bit 6                "input_current": true, 
                    load: consts.equStatus.mppt.load[consts.equStatus.ENUM_PREFIX + statusBits[7] + statusBits[8]],             // bit 7,8              "load": "ok", 
                    pv_input: utils.tristateBoolean(statusBits[9], "ok", "short"),                                                            // bit 9                "pv_input": true, 
                    charging: consts.equStatus.mppt.charging[consts.equStatus.ENUM_PREFIX + statusBits[10] + statusBits[11]],   // bit 10,11            "charging": "not-charging", 
                    system: utils.tristateBoolean(statusBits[12], "ok", "fault"),                                                             // bit 12               "system": true,  
                    standby: utils.tristateBoolean(statusBits[13], "standby", "running")                                                             // bit 13               "standby": true } 
                }

                // add generic attributes
                let dataItemClone = super.addGenericAttributes(dataObj, sender);                // clone the dataItem and add common attributes (time_event, time_zone, time_processing)

                // add the dataitem to the message buffer
                msgObj.messages.push(super.createMessage(key, dataItemClone));                 // add to the message array

            });

            // replace data array with newly created dataItems array
            dataItemCount += dataset.data.length;


        });

        msgObj.itemCount = dataItemCount;
        return msgObj;

    }

}



module.exports = MonitoringMppt;
