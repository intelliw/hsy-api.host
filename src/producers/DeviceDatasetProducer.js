//@ts-check
"use strict";
/**
 * ./producers/DevicesDatasetsProducer.js
 *  Kafka message producers for api devices.datasets.post 
 */
const consts = require('../host/constants');
const enums = require('../host/enums');

const Producer = require('../producers');

/**
 * 
 */
class DeviceDatasetProducer extends Producer {
    /**
    instance attributes:  

     constructor arguments  
    * @param {*} dataSource         //  identifies the source of the data. this value is added to sys.source attribute in addMessage()
    */
    constructor(dataSource) {

        // call super
        let clientId = enums.messageBroker.producers.clientId.devices;      // e.g. 'device.datasets'
        super(clientId, enums.messageBroker.ack.leader, dataSource);                    // only waits for the leader to acknowledge 

    }

    /**
     each dataset object has an object property named after the dataset e.g. "pms": { "id": "PMS-01-001" }    
    datasetName this is also the topic                                      // e.g. pms - 
    datasets    object array of dataset items. 
        each dataset item has an id and an array of data objects each with an event timestamp
        e.g. 
            { "pms": { "id": "PMS-01-001" }, 
            "data": [
                { "time": "20190209T150006.032+0700",
                  "pack": { "id": "0241", "dock": 1, "amps": "-1.601", "temp": ["35.0", "33.0", "34.0"] },
                  "cell": { "open": [1, 6], "volts": ["3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.92", "3.91"] },
                  "fet": { "open": [1, 2], "temp": ["34.1", "32.2", "33.5"] }
                },
    datasource - is based on the api key and identifies the source of the data. this value is added to sys.source attribute
    */
    extractData(datasetName, datasets, datasource) {
        let key;
        let status = false;

        // extract and add messages to super 
        datasets.forEach(dataset => {

            key = dataset[datasetName].id;                              // e.g. id from.. "pms": { "id": "PMS-01-001" }, "data": [ .. ]

            // add each data item in the dataset as an individual message
            dataset.data.forEach(dataItem => {                          // e.g. "data": [

                // add data elements into the dataset
                dataItem = addAttributes(key, datasetName, dataItem);

                // add the message to the producer buffer
                super.addMessage(key, dataItem);
                console.log(key);
            });
        });

        status = true;

        return status;
    }

}

// adds calculated data elements into the dataitem e.g. 'pack.volts' and 'pack.watts'
function addAttributes(key, datasetName, dataItem) {
    
    let attrArray = [];
    let watts;
    let volts;

    const PRECISION = 3;
    const TO_MILLIVOLTS = 1000;

    switch (datasetName) {

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
                ...dataItem
            }

            dataItem.pack = {
                id: p.id,
                dock: p.dock,
                volts: parseFloat(volts),
                amps: p.amps,
                watts: parseFloat(watts),
                temp: p.temp,
            };
            dataItem.cell = {...p.cell, vcl: vcl, vch: vch, dvcl: dvcl};
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

module.exports = DeviceDatasetProducer;