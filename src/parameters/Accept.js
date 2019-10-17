//@ts-check
"use strict";
/**
 * ./parameters/Accept.js
 * the validated request Accept type
 *  
 */
const consts = require('../configs/constants');

const Param = require('./Param');

const NONE = global.undefined;
const THIS_PARAM_NAME = consts.params.names.acceptType;     //i.e: 'accept'

/** 
 * Selects an Accepts header. If an Accept header has not beem specified the default application/vnd.collection+json media type will be returned.
 * If multiple Accept headers are sent the response will select one from the list of media types shown above, in the order shown.
 * If the request Accept headers do not contain a type from the list above return 'undefined'
 */
class Accept extends Param {
    /**
    instance attributes:  
     super.name: "accept", 
     super.value: ?,
     super.isValid: ?,
    
     constructor arguments  
    * @param {*} req                                                        // express request
    * @param {*} responseProduces                                           // array of enum.mimeTyypes which are supported by the response/producer
    */
    constructor(req, responseProduces) {
        
        let requestAcceptsType = req.accepts(responseProduces);             // express returns false if request had Accept headers which do not match any of the responseContentTypes

        // call super
        requestAcceptsType = (requestAcceptsType == false) ? NONE : requestAcceptsType;  // if there  is no value super wil set isValid to false./.
        super(THIS_PARAM_NAME, requestAcceptsType);
        
    }

}

module.exports = Accept;
