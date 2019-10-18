//@ts-check
'use strict';

/**
 * ./common/errors.js
 * performs all error reporting operations 
 */
const { ErrorReporting } = require('@google-cloud/error-reporting');
const enums = require('../environment/enums');
const env = require('./env');

// create a Error Reporting instance  
module.exports.LOGGER = new ErrorReporting({                              // all configuration options are optional.
    reportMode: env.active.stackdriver.errors.reportMode,                       // 'production' (default), 'always', 'never' - production will not log unless NODE-ENV=production. Specifies when errors are reported to the Error Reporting Console. 
    logLevel: env.active.stackdriver.errors.logLevel,                           // 2 (warnings). 0 (no logs) 5 (all logs) 
    // projectId: 'my-project-id',
    // keyFilename: '/path/to/keyfile.json',
    // credentials: require('./path/to/keyfile.json'),
    // serviceContext: {
    //     service: 'my-service',
    //     version: 'my-service-version'
    // }
});


/* uses errorObj.event method to create an ErrorMessage object. Uses stack trace at the point where error event is constructed.
- errorMessage can be anything depending on the specific context
- functionName is the name of the function from which the error was raised
*/
module.exports.reportingEvent = (errorMessage) => {

    const activeConf = env.active;                                 // get the active environment configs

    // append stackdriver                                                         
    if (activeConf.logging.appenders.includes(enums.logging.appenders.stackdriver)) {


        let errorEvent = this.LOGGER.event()
            .setMessage(errorMessage)
            .serviceContext = {
                service: activeConf.api.host,
                version: activeConf.api.versions.current,
                resourceType: env.active.stackdriver.logging.resource                      // e.g. gce_instance
            };

        this.LOGGER.report(errorEvent);
    };


    // append console            
    if (activeConf.logging.appenders.includes(enums.logging.appenders.console)) {

        console.error(`${errorMessage}`);

    };

}


/* uses errorObj.report method to create an Error object. Uses stack trace at the point where error was instantiated.
- errorMessage can be anything depending on the specific context
- functionName is the name of the function from which the error was raised
*/
module.exports.reportingMessage = (errorMessage) => {


    const activeConf = env.active;                             // get the active environment configs

    // append stackdriver                                                         
    if (activeConf.logging.appenders.includes(enums.logging.appenders.stackdriver)) {

        this.LOGGER.report(new Error(errorMessage));
    };

    // append console            
    if (activeConf.logging.appenders.includes(enums.logging.appenders.console)) {

        console.error(`${errorMessage}`);

    };

}