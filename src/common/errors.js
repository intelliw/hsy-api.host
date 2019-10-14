//@ts-check
'use strict';

/**
 * ./common/errors.js
 * performs all error reporting operations 
 */
const { ErrorReporting } = require('@google-cloud/error-reporting');
const enums = require('../host/enums');
const config = require('../host/config');


// create a Error Reporting instance                                        
module.exports.errorObj = new ErrorReporting({                              // all configuration options are optional.
    reportMode: config.stackdriver.errors.reportMode,                       // 'production' (default), 'always', 'never' - production will not log unless NODE-ENV=production. Specifies when errors are reported to the Error Reporting Console. 
    logLevel: config.stackdriver.errors.logLevel,                           // 2 (warnings). 0 (no logs) 5 (all logs) 
    // projectId: 'my-project-id',
    // keyFilename: '/path/to/keyfile.json',
    // credentials: require('./path/to/keyfile.json'),
    // serviceContext: {
    //     service: 'my-service',
    //     version: 'my-service-version'
    // }
});


// uses errorObj.event method to create an ErrorMessage object. Uses stack trace at the point where error event is constructed.
module.exports.reportEvent = (message, user) => {

    let errorEvent = this.errorObj.event()
        .setMessage(message)
        .setUser(user);

    this.errorObj.report(errorEvent, () => console.error(message));
}


// uses errorObj.report method to create an Error object. Uses stack trace at the point where error was instantiated.
module.exports.reportMessage = (message) => {

    this.errorObj.report(new Error(message), () => console.error(message));
}