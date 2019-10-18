//@ts-check
"use strict";
/**
 * ./parameters/ApiKey.js
 * an api key taken from a request header (preferred) or query parameter 
 *  
 */
const consts = require('../configs/constants');

const enums = require('../environment/enums');

const Param = require('./Param');


// const QUERY_APIKEY_NAME = 'api_key'                          // `api_key` query parameter is no loger supported. 
const THIS_PARAM_NAME = consts.params.names.apiKey;
const HEADER_APIKEY_NAME = enums.request.headers.apiKey         // POST, GET | `x-api-key` | header | POST requests must provide a `x-api-key` header. This option is also preferred for GET requests.
const NONE = global.undefined;


/** 
 * gets the api key from the request header (preferred) or query parameter 
 * if no key is provided in the request a default apikey (enums.apiKey.default) is injected into the request
 */
class ApiKey extends Param {
    /**
    instance attributes:  
     super.name: "apikey", 
     super.value: ?,
     super.isValid: ?,
    
     constructor arguments  
    * @param {*} req                    // express request
    * @param {*} apikeyRequired         // whether a apikeyis required, if false (not reuqired) and no key provided a default apikey (enums.apiKey.default) is injected
    */
    constructor(req, apikeyRequired) {
        
        // get apikey - header is preferred
        let headerKey = req.headers[HEADER_APIKEY_NAME];
        
        // decide whether to default - if apikeyRequired there should be no default 
        let defaultApikey = apikeyRequired ? NONE : enums.apiKey.default;

        // call super 
        super(THIS_PARAM_NAME, headerKey, defaultApikey, enums.apiKey, false);
    }

}

module.exports = ApiKey;
