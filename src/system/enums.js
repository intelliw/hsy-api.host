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

module.exports.datasetsPMSEPACK = {
    eventtime: 'event.time',
    vcell01: 'vcell.01',
    vcell02: 'vcell.02',
    vcell03: 'vcell.03',
    vcell04: 'vcell.04',
    vcell05: 'vcell.05',
    vcell06: 'vcell.06',
    vcell07: 'vcell.07',
    vcell08: 'vcell.08',
    vcell09: 'vcell.09',
    vcell10: 'vcell.10',
    vcell11: 'vcell.11',
    vcell12: 'vcell.12',
    vcell13: 'vcell.13',
    vcell14: 'vcell.14',
    packsoc: 'pack.soc',
    vpack: 'vpack',
    packcurrent: 'pack.current',
    tempbottom: 'temp.bottom',
    tempmid: 'temp.mid',
    temptop: 'temp.top',
    cmosstatus: 'cmos.status',
};

module.exports.datasetsMPPTSNMP = {
    eventtime: 'event.time',
    pv1: 'pv1',
    pv2: 'pv2',
    chg1current: 'chg.1.current',
    chg2current: 'chg.2.current',
    battvoltage: 'batt.voltage',
    lvd1vsat: 'lvd.1.vsat',
    lvd2bts: 'lvd.2.bts',
    vsatcurrent: 'vsat.current',
    btscurrent: 'bts.current'
};

module.exports.timeOfDay = {
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    night: 'night'
};

// mime types used in headers
module.exports.mimeTypes = {
    applicationCollectionJson : 'application/vnd.collection+json',
    applicationJson : 'application/json',
    textHtml : 'text/html',
    textPlain : 'text/plain'
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
    none : global.undefined
};
module.exports.linkRender.default = this.linkRender.none;

module.exports.responseStatus = {
    OK: 200,
    Created: 201,
    BadRequest: 400,
    Unauthorized: 401,
    NotFound: 404,
    UnsupportedMediaType: 415,
    InternalServerError: 500
}