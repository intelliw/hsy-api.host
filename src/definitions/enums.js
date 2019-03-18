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

module.exports.period = {
    instant: 'instant',
    second: 'second',
    hour: 'hour',
    timeofday: 'timeofday',
    day: 'day',
    week: 'week',
    month: 'month',
    quarter: 'quarter',
    year: 'year',
    fiveyear: '5year'
};

module.exports.datasets = {
    MPPTSNMP: 'MPPT-SNMP',
    PMSEPACK: 'PMS-EPACK'
};

module.exports.energyData = {
    hse: 'hse',
    harvest: 'harvest',
    storein: 'store.in',
    storeout: 'store.out',
    enjoy: 'enjoy',
    gridin: 'grid.in',
    gridout: 'grid.out'
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
