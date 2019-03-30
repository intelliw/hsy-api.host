//@ts-check
"use strict";
/**
 * ./operations/Op.js
 * base class for operation classes
 *  
 */
const enums = require('../system/enums');
/**
* stores data and status for an operation in a Response object, and the headers
*/
class Request {

    /**
     * base constructor selects and sets mime type and checks if params are valid
     */
    constructor(reqAccepts, params) {

        this.accept = chooseMimeType(reqAccepts);
        
        // params
        let paramsObj = {};
        let isValid = true;                                         
        if (params) {

            params.forEach(param => {

                isValid = isValid && param.isValid;                 // check if param was valid during its construction 
                paramsObj[param.name] = param;                      // assign the param to an object  

            });
            this.isValid = isValid;
        }
        this.params = paramsObj;                                    // assign the object as an instance property e.g this.params.energy

    }

    // subtype implements xecute method 
    execute() {

    }

}

//prioritises and selects a mime type from the list of request Accept headers 
function chooseMimeType(reqAcceptHeaders) {

    const e = enums.mimeTypes;
    let header = e.default;                                 // start with the default - if no match this will be returned 

    if (reqAcceptHeaders.includes(e.applicationCollectionJson)) {
        header = e.applicationCollectionJson;

    } else if (reqAcceptHeaders.includes(e.applicationJson)) {
        header = e.applicationJson;

    } else if (reqAcceptHeaders.includes(e.textHtml)) {
        header = e.textHtml;                               // todo:  develope a viewfor text/html 


    } else if (reqAcceptHeaders.includes(e.textPlain)) {
        header = e.textPlain;

    }

    return header;

}

module.exports = Request;
