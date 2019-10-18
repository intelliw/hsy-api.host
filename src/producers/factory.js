//@ts-check
"use strict";
/**
 * ./producers/factory.js
 */
const enums = require('../environment/enums');

const Producer = require('../producers');

class factory {
    /**
     * a factory class to create the right producer based on its datasetname
    */
    constructor() {
    }

    // a factory method to return the correct producer subtype for the datasetname
    static getProducer(apiDatasetName) {
        let producer;
        switch (apiDatasetName) {

            // pms
            case enums.params.datasets.pms:
                producer = new Producer.MonitoringPms();
                break;

            // mppt 
            case enums.params.datasets.mppt:
                producer = new Producer.MonitoringMppt();
                break;

            // inverter 
            case enums.params.datasets.inverter:
                producer = new Producer.MonitoringInverter();
                break;

        }
        return producer;
    }

}

module.exports = factory;
