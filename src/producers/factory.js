//@ts-check
"use strict";
/**
 * ./producers/factory.js
 */
const enums = require('../host/enums');

const Producer = require('../producers');

class factory {
    /**
     * a factory class to create the right producer based on its datasetname
    */
    constructor() {
    }

    // a factory method to return the correct producer subtype for the datasetname
    static getProducer(datasetName) {
        let producer; 
        switch (datasetName) {

            // pms
            case enums.datasets.pms:
                producer = new Producer.MonitoringPms ();
                break;

            // mppt 
            case enums.datasets.mppt:
                producer = new Producer.MonitoringMppt();
                break;

            // inverter 
            case enums.datasets.inverter:
                producer = new Producer.MonitoringInverter();
                break;

        }
        return producer;
    }

}

module.exports = factory;
