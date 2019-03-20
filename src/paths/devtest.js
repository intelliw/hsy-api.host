//@ts-check
"use strict";
/**
 * ./route/devtest.js
 * handlers for sandbox routes, for testing only/. these routes do not exist in the endpoint definition 
 * basepath /devtest
 */

const express = require('express');
const router = express.Router();
const consts = require('../definitions').constants;


// @ts-ignore
const vehicle = require('./vehicle');
const params = require('../parameters');

router.get('/test2', (req, res, next) => {

    res
    .status(200)
    .json({ message: e. })
    .end();

});

router.get('/test1', (req, res, next) => {

    // @ts-ignore
    let t = require('../parameters/Test');
    // const custom = new t();
    const foo = new t.Foo();
    
    res
    .status(200)
    .json({ message: 'ok' })
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
        authUser = JSON.parse(Buffer.from(encodedInfo, 'base64'));
    }
    res
        .status(200)
        .json(authUser)
        .end();
}

module.exports = router;
