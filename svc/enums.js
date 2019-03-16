/**
 * ./svc/enum.js
 * global enumerations
 */
let Enum = require('enum');

module.exports.energy = new Enum([
    "hse",
    "harvest",
    "store",
    "enjoy",
    "grid"
]);

module.exports.period = new Enum([
    "instant",
    "second",
    "hour",
    "timeofday",
    "day",
    "week",
    "month",
    "quarter",
    "year",
    "5year"
]);

module.exports.datasets = new Enum([
    "MPPT-SNMP",
    "PMS-EPACK"
]);

module.exports.energyData = new Enum([
    "hse",
    "harvest",
    "store.in",
    "store.out",
    "enjoy",
    "grid.in",
    "grid.out"
]);

module.exports.datasetsPMSEPACK = new Enum([
    "event.time",
    "vcell.01",
    "vcell.02",
    "vcell.03",
    "vcell.04",
    "vcell.05",
    "vcell.06",
    "vcell.07",
    "vcell.08",
    "vcell.09",
    "vcell.10",
    "vcell.11",
    "vcell.12",
    "vcell.13",
    "vcell.14",
    "pack.soc",
    "vpack",
    "pack.current",
    "temp.bottom",
    "temp.mid",
    "temp.top",
    "cmos.status",
    "cmos.status"
]);

module.exports.datasetsMPPTSNMP = new Enum([
    "event.time",
    "pv1",
    "pv2",
    "chg.1.current",
    "chg.2.current",
    "batt.voltage",
    "lvd.1.vsat",
    "lvd.2.bts",
    "vsat.current",
    "bts.current"
]);
