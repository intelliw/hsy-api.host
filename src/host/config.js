//@ts-check
'use strict';
/**
 * ./host/config.js
 * configuration settings 
 */
const consts = require('../host/constants');

module.exports.initialise = function (app) {
    
    // express initialisations
    app.set('case sensitive routing', true);
    app.disable('x-powered-by');                    // disable the 'X-Powered-By →Express' header 

    app.set('view engine', 'ejs');                  // set engine
    app.set('views', consts.folders.VIEWS);         // ejs templates folder

}

// constants for the api and host
module.exports.api = {
    versions: {
        supported: '0.2 0.3',
        current: '0.3.12.10'
    }
}

// system configuration constants
module.exports.system = {
    MONITORING_PRECISION: 4,                                                // decimal places for float values in monitoring dataset
    BODYPARSER_LIMIT_MB: 1                                                  // max mb for post messages 
}

// stackdriver client configuration options
module.exports.stackdriver = {
    logging: {
        logName: 'monitored.equipment',
        resource: 'gce_instance'
    },
    errors: {
        reportMode: 'always',                                                 // 'production' (default), 'always', or 'never' - 'production' (default), 'always', 'never' - production will not log unless NODE-ENV=production. Specifies when errors are reported to the Error Reporting Console.      
        logLevel: 5                                                           // 2 (warnings). 0 (no logs) 5 (all logs) 
    }
}
