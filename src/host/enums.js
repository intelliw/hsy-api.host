//@ts-check
/**
 * ./svc/enum.js
 * global enumerations
 */

module.exports.energy = {
    hse: 'hse',
    harvest: 'harvest',
    store: 'store',
    enjoy: 'enjoy',
    grid: 'grid'
};
module.exports.energy.default = this.energy.hse;

module.exports.energyData = {
    hse: 'hse',
    harvest: 'harvest',
    storein: 'store.in',
    storeout: 'store.out',
    enjoy: 'enjoy',
    gridin: 'grid.in',
    gridout: 'grid.out'
};

module.exports.period = {
    instant: 'instant',
    second: 'second',
    minute: 'minute',
    hour: 'hour',
    timeofday: 'timeofday',
    day: 'day',
    week: 'week',
    month: 'month',
    quarter: 'quarter',
    year: 'year',
    fiveyear: 'fiveyear'
};
module.exports.period.default = this.period.week;

module.exports.datasets = {                     // kafka topics are based on enums.datasets. preferred convention is <message type>_<api base/db name>_<dataset /table name> 
    pms: 'pms',                                 // corresponds to messageBroker.consumers.pms
    mppt: 'mppt',                               // corresponds to messageBroker.consumers.mppt
    inverter: 'inverter'                        // corresponds to messageBroker.consumers.inverter
};

module.exports.timeOfDay = {
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    night: 'night'
};

// request enumerations
module.exports.request = {
    headers: {
       contentType: 'content-type'
    }
}

// mime types used in headers
module.exports.mimeTypes = {
    applicationCollectionJson: 'application/vnd.collection+json',
    applicationJson: 'application/json',
    textHtml: 'text/html',
    textPlain: 'text/plain',
    textCsv: 'text/csv'
};
module.exports.mimeTypes.default = this.mimeTypes.applicationCollectionJson;

// supported RFC8288 Link-relations for 'rel' property in Response objects
module.exports.linkRelations = {
    self: 'self',
    collection: 'collection',
    up: 'up',
    next: 'next',
    prev: 'prev'
};

// hypermedia link rendering values
module.exports.linkRender = {
    link: 'link',
    image: 'image',
    none: global.undefined
};
module.exports.linkRender.default = this.linkRender.none;

module.exports.responseStatus = {
    '200': 'OK',
    '201': 'Created',
    '204': 'Created',
    '400': 'Bad Request',
    '401': 'Unauthorized',
    '404': 'Not Found',
    '415': 'Unsupported Media Type',
    '500': 'Internal Server Error',
}

module.exports.apiKey = {
    S000: 'AIzaSyD3IbFpxrydZuMKgEluHWDAvFl-P7dgPC8',
    S001: 'AIzaSyAZ4nuWP-ZXUg2aGQhrQjkvF2BFvukgv7w',    // Fahmi
    S002: 'AIzaSyDq97s15fdM99swOJuUIFtW8ifgQSBnymo',    // Adam 
    S003: 'AIzaSyBczHFIdt3Q5vvZq_iLbaU6MlqzaVj1Ue0',
    V001: 'AIzaSyASFQxf4PmOutVS1Dt99TPcZ4IQ8PDUMqY'
}
module.exports.apiKey.default = this.apiKey.AIzaSyBczHFIdt3Q5vvZq_iLbaU6MlqzaVj1Ue0; 

module.exports.messageBroker = {                    // kafka message broker. topics are based on enums.datasets. 
    ack: {
        all: -1,                                    // -1 = all replicas must acknowledge (default) 
        none: 0,                                    //  0 = no acknowledgments 
        leader: 1                                   //  1 = only waits for the leader to acknowledge 
    },
    producers: {                                    // producer client Ids
        clientId: {                                 
            default: 'clientid.apihost'             // producer client id - preferred convention = <api path>.<api path>
        }
    },
    topics: {                                       //  topic names 
        monitoring: {                               //  topics for monitoring datasets
            pms: 'monitoring.pms',     
            mppt: 'monitoring.mppt',        
            inverter: 'monitoring.inverter'
        }
    }
}
module.exports.messageBroker.ack.default = this.messageBroker.ack.leader
