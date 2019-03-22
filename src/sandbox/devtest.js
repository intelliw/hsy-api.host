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
router.get('/periods/:period?/:epoch?/:duration?', (req, res, next) => {

    console.log(req.params.period);

    let periodObj = new Param.Period(req.params.period, req.params.epoch);
    let msg;
    msg = `epoch ${req.params.epoch}, duration ${req.params.duration}`
    res
        .status(200)
        .json({
            params: msg,
            PERIOD: periodObj
        })
        .end();
});

// periods object test
router.get('/allperiods/:epoch?/:duration?', (req, res, next) => {

    // get params for all periods 
    let instant = new Param.Period(enums.period.instant, req.params.epoch);
    let instantnext = instant.getNext();
    let instantprev = instant.getPrev();

    let second = new Param.Period(enums.period.second, req.params.epoch);
    let secondnext = second.getNext();
    let secondprev = second.getPrev();

    let minute = new Param.Period(enums.period.minute, req.params.epoch);
    let minutenext = minute.getNext();
    let minuteprev = minute.getPrev();

    let hour = new Param.Period(enums.period.hour, req.params.epoch);
    let hournext = hour.getNext();
    let hourprev = hour.getPrev();

    let timeofday = new Param.Period(enums.period.timeofday, req.params.epoch);
    let timeofdaynext = timeofday.getNext();
    let timeofdayprev = timeofday.getPrev();

    let day = new Param.Period(enums.period.day, req.params.epoch);
    let daynext = day.getNext();
    let dayprev = day.getPrev();

    let week = new Param.Period(enums.period.week, req.params.epoch);
    let weeknext = week.getNext();
    let weekprev = week.getPrev();

    let month = new Param.Period(enums.period.month, req.params.epoch);
    let monthnext = month.getNext();
    let monthprev = month.getPrev();

    let quarter = new Param.Period(enums.period.quarter, req.params.epoch);
    let quarternext = quarter.getNext();
    let quarterprev = quarter.getPrev();

    let year = new Param.Period(enums.period.year, req.params.epoch);
    let yearnext = year.getNext();
    let yearprev = year.getPrev();

    let fiveyear = new Param.Period(enums.period.fiveyear, req.params.epoch);
    let fiveyearnext = fiveyear.getNext();
    let fiveyearprev = fiveyear.getPrev();

    let msg;
    msg = `epoch ${req.params.epoch}, duration ${req.params.duration}`
    res
        .status(200)
        .json({
            params: msg,

            INSTANTPREV: instantprev,
            INSTANT: instant,
            INSTANTNEXT: instantnext,

            SECONDPREV: secondprev,
            SECOND: second,
            SECONDNEXT: secondnext,

            MINUTEPREV: minuteprev,
            MINUTE: minute,
            MINUTENEXT: minutenext,

            HOURPREV: hourprev,
            HOUR: hour,
            HOURNEXT: hournext,

            TIMEOFDAYPREV: timeofdayprev,
            TIMEOFDAY: timeofday,
            TIMEOFDAYNEXT: timeofdaynext,

            DAYPREV: dayprev,
            DAY: day,
            DAYNEXT: daynext,

            WEEKPREV: weekprev,
            WEEK: week,
            WEEKNEXT: weeknext,

            MONTHPREV: monthprev,
            MONTH: month,
            MONTHNEXT: monthnext,

            QUARTERPREV: quarterprev,
            QUARTER: quarter,
            QUARTERNEXT: quarternext,

            YEARPREV: yearprev,
            YEAR: year,
            YEARNEXT: yearnext,

            FIVEYEARPREV: fiveyearprev,
            FIVEYEAR: fiveyear,
            FIVEYEARNEXT: fiveyearnext
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
