//@ts-check
"use strict";
/**
 * ./route/devtest.js
 * handlers for sandbox routes, for testing only/. these routes do not exist in the endpoint definition 
 * basepath /devtest
 */

const express = require('express');
const router = express.Router();
const Buffer = require('safe-buffer').Buffer;

const enums = require('../definitions/enums');
const consts = require('../definitions/constants');
const Param = require('../parameters');

// @ts-ignore
const vehicle = require('./vehicle');
const params = require('../parameters');


// [energy.type.period.epoch.get] /energy/{energy}/{period}/{epoch}/{number}
router.get('/energy/:energy?/:period?/:epoch?/:duration?', (req, res, next) => {
    let noEnum = global.undefined;

    // validate and default all parameters 
    let site = new Param('site', req.query.site, consts.params.DEFAULT_SITE);
    let energy = new Param('energy', req.params.energy, enums.energy.default, enums.energy);
    let duration = new Param('duration', req.params.duration, consts.params.DEFAULT_DURATION, noEnum);
    let period = new Param.Period(req.params.period, req.params.epoch);

    let msg;
    msg = energy.value + ',' + period.value + ',' + period.epoch + ',' + period.end + ',' + duration.value + ',' + site.value;
    res
        .status(200)
        .json({ params: msg, period: period })
        .end();
});

// period object test
router.get('/periods/:epoch?/:duration?', (req, res, next) => {
    
    // get params for all periods 
    let instant = new Param.Period(enums.period.instant, req.params.epoch);
    let second = new Param.Period(enums.period.second, req.params.epoch);
    let minute = new Param.Period(enums.period.minute, req.params.epoch);
    let hour = new Param.Period(enums.period.hour, req.params.epoch);
    let timeofday = new Param.Period(enums.period.timeofday, req.params.epoch);
    let day = new Param.Period(enums.period.day, req.params.epoch);
    let week = new Param.Period(enums.period.week, req.params.epoch);
    let month = new Param.Period(enums.period.month, req.params.epoch);
    let quarter = new Param.Period(enums.period.quarter, req.params.epoch);
    let year = new Param.Period(enums.period.year, req.params.epoch);
    let fiveyear = new Param.Period(enums.period.fiveyear, req.params.epoch);

    let msg;
    msg = `epoch ${req.params.epoch}, duration ${req.params.duration}`
    res
        .status(200)
        .json({ params: msg, 
            INSTANT: instant,
            SECOND: second,
            MINUTE: minute,
            HOUR: hour,
            TIMEOFDAY: timeofday,
            DAY: day,
            WEEK: week,
            MONTH: month,
            QUARTER: quarter,
            YEAR: year,
            FIVEYEAR: fiveyear,
         })
        .end();
});

router.get('/echo', (req, res, next) => {

    res
        .status(200)
        .json({ message: 'echo' })
        .end();
});


// these are sandbox routes for testing only
router.get('/car', (req, res, next) => {

    let site = new vehicle.Group(11, 2, 3).getID();
    let car = vehicle.createCar({ engine: '2.5L', trasmission: 'auto' });
    let bus = new vehicle.Bus({ engine: '6.0L', trasmission: 'manual' });
    //let car = {engine: '2.0L', start: 'proximity'};

    // choose the ejs template here and also the response content type, based on the request Accepts header 
    let contentType = (req.accepts(consts.mimeTypes.textHtml)) ? consts.mimeTypes.textHtml : consts.mimeTypes.applicationCollectionJson;

    let paramE = new params.Period('storex');
    console.log('paramE Name = ' + paramE.name + ', paramE Value = ' + paramE.value);

    // send the response
    res
        .status(200)
        .type(contentType)                              // same as res.set('Content-Type', 'text/html')
        .render('energyData', { user: 'Any User?', title: 'homepage', car: car, bus: bus });

});

// SECURITY tests
router.get('/auth/info/googlejwt', authInfoHandler);

router.get('/auth/info/googleidtoken', authInfoHandler);

function authInfoHandler(req, res) {
    let authUser = { id: 'anonymous' };
    const encodedInfo = req.get('X-Endpoint-API-UserInfo');
    if (encodedInfo) {
        authUser = JSON.parse(Buffer.from(encodedInfo, 'base64').toString());
    }
    res
        .status(200)
        .json(authUser)
        .end();
}

module.exports = router;
