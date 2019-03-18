//@ts-check
"use strict";
/**
 * ./parameters/Energy.js
 *  
 */
const def = require('../definitions');
const Param = require('./Param');

const defaultParamName = 'energy';      // name is a constant as EnergyParam class applies exclusively to the 'energy' request parameter 

// checks if value is in enum otrherwise defaults it to 'hse'
class EnergyParam extends Param{
    constructor(value) {

        // check value if valid or default to hse   
        value = def.enums.energy[value] ? value : def.enums.energy.hse;

        super(defaultParamName, value);         // use super to store instance variables
    }
}

module.exports = EnergyParam;
