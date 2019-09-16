//@ts-check
"use strict";
/**
 * ./producers/MonitoringPms.js
 *  Kafka pms message producer for api devices.datasets.post  
 */
const consts = require('../host/constants');
const enums = require('../host/enums');

const Producer = require('../producers');

const CLIENT_ID = enums.messageBroker.producers.clientId.devices;                   // e.g. 'device.datasets'

/**
 */
class MonitoringPms extends Producer {
    /**
    instance attributes:  

     constructor arguments  
    * @param {*} sender                                                         //  identifies the source of the data. this value is added to sys.source attribute in addMessage()
    */
    constructor(datasetName, datasets, sender) {

        // construct super
        super(datasetName, datasets, sender, CLIENT_ID);                        // only waits for the leader to acknowledge 

    }

    // adds calculated elements specific to this dataset, into the dataitem e.g. 'pack.volts' and 'pack.watts'
    addDatasetAttributes(key, dataItem) {

        let watts;
        let volts;

        const TO_MILLIVOLTS = 1000;

        let p = dataItem.pack;                                                                      // all data objects in the sent message are inside pack
        let vcl = Math.min(...p.cell.volts);
        let vch = Math.max(...p.cell.volts);
        let dvcl = p.cell.volts.map(element => (parseFloat(((element - vcl) * TO_MILLIVOLTS).toFixed())));

        // pack.volts,  pack.watts
        volts = dataItem.pack.cell.volts.reduce((sum, x) => sum + x).toFixed(consts.MONITORING_PRECISION);            // sum all the cell volts to get pack volts
        watts = (volts * dataItem.pack.amps).toFixed(consts.MONITORING_PRECISION);

        //  reconstruct dataitem - add new attributes and flatten cell and fet as peers of pack
        dataItem = {
            pms_id: key,
            pack_id: p.id,
            ...dataItem
        }

        dataItem.pack = {
            dock: p.dock,
            volts: parseFloat(volts),
            amps: p.amps,
            watts: parseFloat(watts),
            temp: p.temp,
        };
        dataItem.cell = { ...p.cell, vcl: vcl, vch: vch, dvcl: dvcl };
        dataItem.fet = p.fet;

        return dataItem;
    }

}



module.exports = MonitoringPms;