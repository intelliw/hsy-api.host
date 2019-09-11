//@ts-check
"use strict";
/**
 * ./producers/factory.js
 */
const enums = require('../host/enums');

const Producer = require('./Producer');

class factory {
    /**
     * a factory class to create the right producer based on its datasetname
    */
    constructor() {
    }

    // a factory method to return the correct producer subtype for the datasetname
    static getProducer(datasetName, datasets, sender) {
        let producer; 
        switch (datasetName) {

            // pms
            case enums.datasets.pms:
                producer = new Producer.MonitoringPms (datasetName, datasets, sender);
                break;

            // mppt 
            case enums.datasets.mppt:
                producer = new Producer.MonitoringMppt(datasetName, datasets, sender);
                break;

            // inverter 
            case enums.datasets.inverter:
                producer = new Producer.MonitoringInverter(datasetName, datasets, sender);
                break;

        }
        return producer;

    }

}

module.exports = factory;
