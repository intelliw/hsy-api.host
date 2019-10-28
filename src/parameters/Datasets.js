//@ts-check
"use strict";
/**
 * ./parameters/Datasets.js
 *  supertype for Datasets in POST body and datasets posted through a request path
 *  parameter class validates the value in the constructor and stores the parameter name and value
 */

const utils = require('../environment/utils');
const consts = require('../host/constants');

const Param = require('./Param');

const PARAM_NAME = "datasets";

class Datasets extends Param {
    /**
     * instance attributes:  
        "name": "datasets", 
        "value" { "datasets": [ { "mppt": { "id": "IT6415AD-01-001" }, "data": [ .. 
     * constructor validates all datasets and the dataitems in them
     */
    constructor(value) {

        super(PARAM_NAME, value);

    }
}

module.exports = Datasets;
