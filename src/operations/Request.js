//@ts-check
"use strict";
/**
 * ./operations/Op.js
 * base class for operation classes
 *  
 */
const enums = require('../system/enums');
const utils = require('../system/utils');
const consts = require('../system/constants');
/**
* stores data and status for an operation in a Response object, and the headers
*/
class Request {

    /**
     * base constructor validates params and checks authorisation
     * selects a Accept header based on the content types supported by the response 
     */
    constructor(requestParams) {

        // params
        let params = {};
        let isValid = true;
        if (requestParams) {

            requestParams.forEach(param => {                     // Request.isValid is true only if *all* params are valid

                isValid = isValid && param.isValid;              // check if param was valid during its construction 
                params[param.name] = param;                      // assign the param to an object  e.g. params.energy

            });
            this.isValid = isValid;
        }
        this.params = params;                                    // assign the object as an instance property e.g this.params.energy

    }

    // super implements generic response for 400s and 401s. subtype implements execute method for each specific 200 response 
    execute() {

        let response = consts.NONE;
        // 2DO: implement 400 foiir isValid = false
        // 2DO: implement 401 for isAuthorised = false

        return response;

    }

}

module.exports = Request;
