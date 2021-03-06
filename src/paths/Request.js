//@ts-check
"use strict";
/**
 * ./paths/Request.js
 * base class for operation classes
 *  
 */
const enums = require('../environment/enums');
const consts = require('../host/constants');

const ErrorResponse = require('./ErrorResponse');
const Param = require('../parameters');
const Validate = require('./Validate');

/**
* stores data and status for an operation in a Response object, and the headers
*/
class Request {

    /**
     * base constructor validates params and checks authorisation
     * selects an Accept header based on the content types supported by the response 
    
     instance attributes:  
     "params": { Param }
     "apiKey": 9IzaSyASFQxf4PmOxtVS1Dt99TPcZ4IQ8PDUMq0 
     "accept": Param.Accept  defaults to first value in response.produces, or undefined if req.accepts is provided and not supported by the response
     "contentType": Param.ContentType  defaults to response.consumes, or undefined if req['content-type'] is provided and not supported by the response
     "validation": { }  
     }  
     "response":{Response}              // set if not valid else subclass sets it    
    
     constructor arguments 
    * @param {*} req                    // express request
    * @param {*} responseProduces       // list of mimetypes which this request's responder (EnergyResponder) is able to produce 
    * @param {*} params                 // list of validated params { }
    * @param {*} responseProduces       // array of mime types which the response is capable of producing and returning
    * @param {*} responseConsumes       // array of mime types which the response expects to consume from the request 
    */
    constructor(req, params, responseProduces, responseConsumes) {
        
        // update instance properties before validation 
        this.params = params;
        this.apiKey = new Param.ApiKey(req);
        this.accept = new Param.Accept(req, responseProduces);
        this.contentType = new Param.ContentType(req, responseConsumes);
        
        //validate the raw request                                                                         // validates.. this.params, this.apikey, and this.accept
        this.validation = new Validate(req, this);
        
        // response
        this.response = this.validation.isValid === true ? consts.NONE : new ErrorResponse(this.validation);    // ErrorResponse contains a generic error message as specified by the swagger genericMessage definition
    }

    // the senderId is the keyname of the apikey enum (e.g. S001 for Sundaya dev and V001 for vendor dev)
    senderId() {
        return Param.ApiKey.getSenderId(this.apiKey.value);
    }

}

module.exports = Request;
