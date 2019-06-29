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

module.exports.datasets = {
    MPPTSNMP: 'MPPT-SNMP',
    PMSEPACK: 'PMS-EPACK'
};

module.exports.datasetPMSEPACK = {
    eventtime: 'eventTime',
    vcell01: 'vcell01',
    vcell02: 'vcell02',
    vcell03: 'vcell03',
    vcell04: 'vcell04',
    vcell05: 'vcell05',
    vcell06: 'vcell06',
    vcell07: 'vcell07',
    vcell08: 'vcell08',
    vcell09: 'vcell09',
    vcell10: 'vcell10',
    vcell11: 'vcell11',
    vcell12: 'vcell12',
    vcell13: 'vcell13',
    vcell14: 'vcell14',
    packsoc: 'pack.soc',
    vpack: 'vpack',
    packcurrent: 'packCurrent',
    tempbottom: 'tempBottom',
    tempmid: 'tempMid',
    temptop: 'tempTop',
    cmosstatus: 'cmosStatus',
};

module.exports.datasetMPPTSNMP = {
    eventtime: 'eventTime',
    pv1: 'pv1',
    pv2: 'pv2',
    chg1current: 'chg1Current',
    chg2current: 'chg2Current',
    battvoltage: 'battVoltage',
    lvd1vsat: 'lvd1Vsat',
    lvd2bts: 'lvd2Bts',
    vsatcurrent: 'vsatCurrent',
    btscurrent: 'btsCurrent'
};

module.exports.timeOfDay = {
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    night: 'night'
};

// mime types used in headers
module.exports.mimeTypes = {
    applicationCollectionJson: 'application/vnd.collection+json',
    applicationJson: 'application/json',
    textHtml: 'text/html',
    textPlain: 'text/plain'
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
    '400': 'Bad Request',
    '401': 'Unauthorized',
    '404': 'Not Found',
    '415': 'Unsupported Media Type',
    '500': 'Internal Server Error',
}

module.exports.apiKey = {
    APIKey4: 'AIzaSyAosx2bIR7K5uyXJeEuwJrFZEpbFYliZ3Y',
    APIKey3: 'AIzaSyDq97s15fdM99swOJuUIFtW8ifgQSBnymo',
    APIKey2: 'AIzaSyBczHFIdt3Q5vvZq_iLbaU6MlqzaVj1Ue0',
    HokuappsKey1: 'AIzaSyASFQxf4PmOutVS1Dt99TPcZ4IQ8PDUMqY'
}

module.exports.dataLogger = {                       // kafka message broker
    ack: {
        all: -1,                                    // -1 = all replicas must acknowledge (default) 
        none: 0,                                    //  0 = no acknowledgments 
        leader: 1                                   //  1 = only waits for the leader to acknowledge 
    },
    topics: {                                       // preferred convention is <message type>_<api base/db name>_<dataset /table name>
        MPPTSNMP: 'MPPT-SNMP',                      // corresponds to enums.datasets.MPPTSNMP
        PMSEPACK: 'PMS-EPACK'                       // corresponds to enums.datasets.PMSEPACK
    },
    producers: {                                    // producer client Ids
        devicesDatasets: 'devices.datasets'
    },
    consumers: {                                    // consumer client Ids
        MPPTSNMP: 'devices.datasets.MPPT-SNMP',    
        PMSEPACK: 'devices.datasets.PMS-EPACK'     
    }
}

module.exports.apiKey.default = this.apiKey.AIzaSyBczHFIdt3Q5vvZq_iLbaU6MlqzaVj1Ue0; 