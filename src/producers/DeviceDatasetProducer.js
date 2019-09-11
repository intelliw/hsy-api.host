//@ts-check
"use strict";
/**
 * ./producers/DevicesDatasetsProducer.js
 *  Kafka message producers for api devices.datasets.post 
 */
const consts = require('../host/constants');
const enums = require('../host/enums');

const Producer = require('../producers');
const CLIENT_ID = enums.messageBroker.producers.clientId.devices;                   // e.g. 'device.datasets'
/**
 * 
 */
class DeviceDatasetProducer extends Producer {
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

        let attrArray = [];
        let watts;
        let volts;

        const PRECISION = 3;
        const TO_MILLIVOLTS = 1000;
        
        switch (this.datasetName) {

            // pms - just append pack.watts
            case enums.datasets.pms:

                let p = dataItem.pack;                                                                      // all data objects in the sent message are inside pack
                let vcl = Math.min(...p.cell.volts);
                let vch = Math.max(...p.cell.volts);
                let dvcl = p.cell.volts.map(element => (parseFloat(((element - vcl) * TO_MILLIVOLTS).toFixed())));

                // pack.volts,  pack.watts
                volts = dataItem.pack.cell.volts.reduce((sum, x) => sum + x).toFixed(PRECISION);            // sum all the cell volts to get pack volts
                watts = (volts * dataItem.pack.amps).toFixed(PRECISION);

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

                break;


            // mppt - append array of pv.watts and load.watts
            case enums.datasets.mppt:

                //  reconstruct dataitem - add new attributes 
                dataItem = {
                    mppt_id: key,
                    ...dataItem
                }

                // pv.watts
                for (let i = 0; i < dataItem.pv.volts.length; i++) {
                    watts = (dataItem.pv.volts[i] * dataItem.pv.amps[i]).toFixed(PRECISION)
                    attrArray.push(parseFloat(watts));
                };
                dataItem.pv.watts = attrArray;

                // load.watts
                attrArray = [];
                for (let i = 0; i < dataItem.load.volts.length; i++) {
                    watts = (dataItem.load.volts[i] * dataItem.load.amps[i]).toFixed(PRECISION);
                    attrArray.push(parseFloat(watts));
                };
                dataItem.load.watts = attrArray;

                break;



            // inverter - append array of pv.watts, load.watts, and grid.watts
            case enums.datasets.inverter:

                //  reconstruct dataitem - add new attributes 
                dataItem = {
                    inverter_id: key,
                    ...dataItem
                }

                // pv.watts
                for (let i = 0; i < dataItem.pv.volts.length; i++) {
                    watts = (dataItem.pv.volts[i] * dataItem.pv.amps[i]).toFixed(PRECISION);
                    attrArray.push(parseFloat(watts));
                };
                dataItem.pv.watts = attrArray;

                // load.watts
                attrArray = [];
                for (let i = 0; i < dataItem.load.volts.length; i++) {
                    watts = (dataItem.load.volts[i] * dataItem.load.amps[i]).toFixed(PRECISION);
                    attrArray.push(parseFloat(watts));
                };
                dataItem.load.watts = attrArray;

                // grid.watts == V x I x pf x √3  
                attrArray = [];
                let sqRootOfThree = Math.sqrt(3);

                for (let i = 0; i < dataItem.grid.volts.length; i++) {
                    watts = (dataItem.grid.volts[i] * dataItem.grid.amps[i] * dataItem.grid.pf[i] * sqRootOfThree).toFixed(PRECISION);
                    attrArray.push(parseFloat(watts));
                };
                dataItem.grid.watts = attrArray;

                break;
        }
        return dataItem;
    }

}



module.exports = DeviceDatasetProducer;