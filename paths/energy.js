/**
 * ./path/energy.js
 * handlers for /energy path  
 */
const express = require('express');
const router = express.Router();

const def = require('../definitions');

// [energy.type.period.epoch.get] /energy/{energy}/{period}/{epoch}/{number}
router.get('/:energy?/:period?/:epoch?/:number?', (req, res, next) => {

    let energyType = req.params.energy;
    let period = req.params.period;
    let epoch = req.params.epoch;
    let num = req.params.number;

    let site = req.query.site;

    let msg;

    //let enums = require('../svc/enum');
    if (def.enums.energy.isDefined(energyType)) {
        console.log(energyType);
    }

    energyType = !energyType ? 'hse' : energyType;
    period = (!period) ? 'period-moment' : period;
    epoch = (!epoch) ? 'now-epoch' : epoch;
    num = (!num) ? 'num' : num;
    site = (!site) ? 'site' : site;

    msg = energyType + ',' + period + ',' + epoch + ',' + num + ',' + site;

    res
        .status(200)
        .json({ message: msg })
        .end();
});

module.exports = router;
