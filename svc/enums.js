/**
 * ./svc/enum.js
 * global enumerations
 */
let Enum = require('enum');

module.exports.energy = function () { return energyEnum; }
module.exports.period = function () { return periodEnum; }
module.exports.datasets = function () { return datasetsEnum; }
module.exports.energyData = function () { return energyDataEnum; }
module.exports.datasetsPMSEPACK = function () { return datasetsPMSEPACKEnum; }
module.exports.datasetsMPPTSNMP = function () { return datasetsMPPTSNMPEnum; }

const energyEnum = new Enum([
    "hse",
    "harvest",
    "store",
    "enjoy",
    "grid"
]);

const periodEnum = new Enum([
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

const datasetsEnum = new Enum([
    "MPPT-SNMP",
    "PMS-EPACK"
]);

const energyDataEnum = new Enum([
    "hse",
    "harvest",
    "store.in",
    "store.out",
    "enjoy",
    "grid.in",
    "grid.out"
]);

const datasetsPMSEPACKEnum = new Enum([
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

const datasetsMPPTSNMPEnum = new Enum([
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