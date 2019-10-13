//@ts-check
'use strict';
/**
 * ./common/logger.js
 * performs all logging operations including changes to log levels at runtime 
 */
const enums = require('../host/enums');

module.exports.verbosity = [enums.verbosity.info];                          // defult is [enums.verbosity.info];


// info and debug
module.exports.infodebug = (topic, offset, msgsarray, itemsqty, sender) => {
    
    let msgsqty = msgsarray.length;

    // info                                 // if info logging on..   e.g. [monitoring.mppt:2-3] 2 messages, 4 items, sender:S001    
    if (this.verbosity.includes(enums.verbosity.info))
        console.log(`[${topic}:${offset}-${Number(offset) + (msgsqty - 1)}] ${msgsqty} msgs, ${itemsqty} items, sender:${sender}`);


    // debug                                // if debug logging on..  e.g. [ { key: '025', value: '[{"pms_id" ....      
    if (this.verbosity.includes(enums.verbosity.debug))
        console.log(msgsarray);

}

// debug 
module.exports.debug = (debugstr) => {

    if (this.verbosity.includes(enums.verbosity.debug))
        console.log(debugstr);

}