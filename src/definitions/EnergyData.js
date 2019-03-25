//@ts-check
"use strict";
/**
 * ./definitions/EnergyData.js
 * An data object for the energy path 
 *  
 */
const moment = require('moment');

const enums = require('../system/enums');
const consts = require('../system/constants');

const Data = require('./Data');

/**
 * adds a Data array to each child in the period passed to the constructor
 */
class EnergyData extends Data {
    /**
    attributes:  
     super.name: "dataset", 
     super.value: "energy",
     "periods": []
     "energy": 'hse'
    */
    constructor(energy, period) {

        const DATASET_NAME = 'energy';

        super('dataset', DATASET_NAME);
        this.periods = period.getEach();                         // get a period array which will have an individual item for each period in the duration
        this.energy = energy.value;                             

        this.addChildData();

    }


    // adds a data array to each child period  // ----------------------------------------------------- to be reviewed
    addChildData() {
        
        for(var i=0; i < this.periods.length; i++) {
            /*
            let children = this.periods[i].children();
            
            for(var x=0; x < children.length; x++) {
                
                let child = children[x];
                let childData = [];

                childData.push(new Data('harvest','34464' ));
                childData.push(new Data('store','34464' ));
                child.addData(childData);

            }
            */
        }

    }

}

module.exports = EnergyData;
