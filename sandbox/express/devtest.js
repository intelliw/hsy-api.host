//@ts-check
"use strict";
/**
 * ./route/devtest.js
 * handlers for sandbox routes, for testing only. these routes do not exist in the openapi endpoint definition 
 * basepath /devtest
 */

const express = require('express');
const router = express.Router();
const Buffer = require('safe-buffer').Buffer;

const enums = require('../../src/environment/enums');
const consts = require('../../src/host/constants');
const Param = require('../../src/parameters');

// @ts-ignore
const vehicle = require('./vehicle');
const NONE = global.undefined;

// [energy.type.period.epoch.get] /energy/{energy}/{period}/{epoch}/{number}
router.get('/energy/:energy?/:period?/:epoch?/:duration?', (req, res, next) => {
    let noEnum = NONE;

    // validate and default all parameters 
    let site = new Param('site', req.query.site, consts.params.defaults.site);
    let energy = new Param('energy', req.params.energy, enums.params.energy.default, enums.params.energy);
    let duration = new Param('duration', req.params.duration, consts.params.defaults.duration, noEnum);
    let period = new Param.Period(req.params.period, req.params.epoch, duration.value);

    let msg;
    msg = energy.value + ',' + period.value + ',' + period.epoch + ',' + period.end + ',' + duration.value + ',' + site.value;
    res
        .status(200)
        .json({ params: msg, period: period })
        .end();
});

// period object test
router.get('/period/:period?/:epoch?/:duration?', (req, res, next) => {

    c@onsole.log(req.params.period);

    let periodObj = new Param.Period(req.params.period, req.params.epoch, req.params.duration);
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
    let instant = new Param.Period(enums.params.period.instant, req.params.epoch, req.params.duration); let instantnext = instant.getNext(); let instantprev = instant.getPrev(); let instantparent = instant.getParent();let instantchild = instant.getChild();
    let second = new Param.Period(enums.params.period.second, req.params.epoch, req.params.duration); let secondnext = second.getNext(); let secondprev = second.getPrev(); let secondparent = second.getParent();let secondchild = second.getChild();
    let minute = new Param.Period(enums.params.period.minute, req.params.epoch, req.params.duration); let minutenext = minute.getNext(); let minuteprev = minute.getPrev(); let minuteparent = minute.getParent();let minutechild = minute.getChild();
    let hour = new Param.Period(enums.params.period.hour, req.params.epoch, req.params.duration); let hournext = hour.getNext(); let hourprev = hour.getPrev(); let hourparent = hour.getParent();let hourchild = hour.getChild();
    let timeofday = new Param.Period(enums.params.period.timeofday, req.params.epoch, req.params.duration); let timeofdaynext = timeofday.getNext(); let timeofdayprev = timeofday.getPrev(); let timeofdayparent = timeofday.getParent();let timeofdaychild = timeofday.getChild();
    let day = new Param.Period(enums.params.period.day, req.params.epoch, req.params.duration); let daynext = day.getNext(); let dayprev = day.getPrev(); let dayparent = day.getParent();let daychild = day.getChild();
    let week = new Param.Period(enums.params.period.week, req.params.epoch, req.params.duration); let weeknext = week.getNext(); let weekprev = week.getPrev(); let weekparent = week.getParent();let weekchild = week.getChild();
    let month = new Param.Period(enums.params.period.month, req.params.epoch, req.params.duration); let monthnext = month.getNext(); let monthprev = month.getPrev(); let monthparent = month.getParent();let monthchild = month.getChild();
    let quarter = new Param.Period(enums.params.period.quarter, req.params.epoch, req.params.duration); let quarternext = quarter.getNext(); let quarterprev = quarter.getPrev(); let quarterparent = quarter.getParent();let quarterchild = quarter.getChild();
    let year = new Param.Period(enums.params.period.year, req.params.epoch, req.params.duration); let yearnext = year.getNext(); let yearprev = year.getPrev(); let yearparent = year.getParent();let yearchild = year.getChild();
    let fiveyear = new Param.Period(enums.params.period.fiveyear, req.params.epoch, req.params.duration); let fiveyearnext = fiveyear.getNext(); let fiveyearprev = fiveyear.getPrev(); let fiveyearparent = fiveyear.getParent();let fiveyearchild = fiveyear.getChild();
    
    let msg;
    msg = `epoch ${req.params.epoch}, duration ${req.params.duration}`
    res
        .status(200)
        .json({
            params: msg,
            // EAChsyCONDSINSTANTS: second.getEachChild(),
            // EACHMINUTESECONDS: minute.getEachChild(),
            INSTANTS : { INSTANTPREV: instantprev, INSTANT: instant, INSTANTNEXT: instantnext, INSTANTPARENT: instantparent,INSTANTCHILD: instantchild },
            SECONDS : { SECONDPREV: secondprev, SECOND: second, SECONDNEXT: secondnext, SECONDPARENT: secondparent,SECONDCHILD: secondchild },
            MINUTES : { MINUTEPREV: minuteprev, MINUTE: minute, MINUTENEXT: minutenext, MINUTEPARENT: minuteparent,MINUTECHILD: minutechild },
            HOURS : { HOURPREV: hourprev, HOUR: hour, HOURNEXT: hournext, HOURPARENT: hourparent,HOURCHILD: hourchild },
            TIMEOFDAYS : { TIMEOFDAYPREV: timeofdayprev, TIMEOFDAY: timeofday, TIMEOFDAYNEXT: timeofdaynext, TIMEOFDAYPARENT: timeofdayparent,TIMEOFDAYCHILD: timeofdaychild },
            DAYS : { DAYPREV: dayprev, DAY: day, DAYNEXT: daynext, DAYPARENT: dayparent,DAYCHILD: daychild },
            WEEKS : { WEEKPREV: weekprev, WEEK: week, WEEKNEXT: weeknext, WEEKPARENT: weekparent,WEEKCHILD: weekchild },
            MONTHS : { MONTHPREV: monthprev, MONTH: month, MONTHNEXT: monthnext, MONTHPARENT: monthparent,MONTHCHILD: monthchild },
            QUARTERS : { QUARTERPREV: quarterprev, QUARTER: quarter, QUARTERNEXT: quarternext, QUARTERPARENT: quarterparent,QUARTERCHILD: quarterchild },
            YEARS : { YEARPREV: yearprev, YEAR: year, YEARNEXT: yearnext, YEARPARENT: yearparent,YEARCHILD: yearchild },
            FIVEYEARS : { FIVEYEARPREV: fiveyearprev, FIVEYEAR: fiveyear, FIVEYEARNEXT: fiveyearnext, FIVEYEARPARENT: fiveyearparent, FIVEYEARCHILD: fiveyearchild },
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
    let contentType = (req.accepts(enums.mimeType.textHtml)) ? enums.mimeType.textHtml : enums.mimeType.applicationCollectionJson;

    let paramE = new Param.Period('week', '20190321', 1);
    c@onsole.log('paramE Name = ' + paramE.name + ', paramE Value = ' + paramE.value);

    // send the response
    res
        .status(200)
        .type(contentType)                              // same as res.set('Content-Type', 'text/html')
        .render('TEST_welcome', { user: 'Any User?', title: 'homepage', car: car, bus: bus });

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
