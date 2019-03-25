//@ts-check
/**
 * PACKAGE: ./system/index.js
 * schemas and constants
 */

 const enums = require('./enums');

module.exports.capitalise = (str) => {return str.charAt(0).toUpperCase() + str.slice(1)};       // capitalise first letter

//accepts an array of headers and selects one based ona priority order
module.exports.selectHeader = (headers) => {
    
    const MISSING = -1;
    
    const e = enums.mimeTypes;
    let header = e.default;                                 // strart with the default - if no match this will be returned 
    
    if (headers.includes(e.applicationCollectionJson)) {
        header = e.applicationCollectionJson;

    } else if (headers.includes(e.applicationJson)) {
        header = e.applicationJson;
        
    } else if (headers.includes(e.textHtml)) {
        header = e.textHtml;

    } else if (headers.includes(e.textPlain)) { 
        header = e.textPlain;

    }

    return header;

}