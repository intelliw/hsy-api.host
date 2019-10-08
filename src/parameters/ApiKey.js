//@ts-check
"use strict";
/**
 * ./parameters/ApiKey.js
 * an api key taken from a request header (preferred) or query parameter 
 *  
 */
const consts = require('../host/constants');
const enums = require('../host/enums');

const Param = require('./Param');

const THIS_PARAM_NAME = consts.params.names.apikey;

const QUERY_APIKEY_NAME = 'api_key'         // GET | `api_key` | query | `api_key` query parameter is accepted only in GET requests. 
const HEADER_APIKEY_NAME = 'x-api-key'      // POST, GET | `x-api-key` | header | POST requests must provide a `x-api-key` header. This option is also preferred for GET requests.

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
        let queryKey = req.query[QUERY_APIKEY_NAME];
        let headerKey = req.headers[HEADER_APIKEY_NAME];
        let requestApikey = headerKey !== consts.NONE ? headerKey : queryKey;
        
        // decide whether to default - if apikeyRequired there should be no default 
        let defaultApikey = apikeyRequired ? consts.NONE : enums.apiKey.default;

        // call super 
        super(THIS_PARAM_NAME, requestApikey, defaultApikey, enums.apiKey, false);
    }

}

module.exports = ApiKey;
