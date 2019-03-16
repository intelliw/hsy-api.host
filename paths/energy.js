/**
 * ./path/energy.js
 * handlers for /energy path  
 */
const express = require('express');
const router = express.Router();

const def = require('../definitions');

// API ROUTE [energy.type.get] /energy/{energy}/{period}/{epoch} --------------------
router.get('/:energy?/:period?/:epoch?/:number?', (req, res) => {

    let energy = req.params.energy;
    let period = req.params.period;
    let epoch = req.params.epoch;
    let num = req.params.number;

    let site = req.query.site;

    let msg;

    //let enums = require('../svc/enum');
    if (def.enums.energy.isDefined(energy)) {
        console.log(energy);
    }

    energy = !energy ? 'hse' : energy;
    period = (!period) ? 'period-moment' : period;
    epoch = (!epoch) ? 'now-epoch' : epoch;
    num = (!num) ? 'num' : num;
    site = (!site) ? 'site' : site;

    msg = energy + ',' + period + ',' + epoch + ',' + num + ',' + site;

    res
        .status(200)
        .json({ message: msg })
        .end();
});

module.exports.router = router;
