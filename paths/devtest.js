/**
 * ./route/devtest.js
 * handlers for sandbox routes, for testing only/. these routes do not exist in the endpoint definition 
 */
const express = require('express');
const router = express.Router();
const consts = require('../definitions').constants;

// DEVTEST ROUTE - these are sandbox routes for testing only
router.get('/car', (req, res, next) => {

    let params = require('./energy-params.js');

    let site = new params.Group(11, 2, 3).getID();
    let car = params.createCar({ engine: '2.5L', trasmission: 'auto' });
    let bus = new params.Bus({ engine: '6.0L', trasmission: 'manual' });
    //let car = {engine: '2.0L', start: 'proximity'};

    // choose the ejs template here and also the response content type, based on the request Accepts header 
    var contentType = (req.accepts(consts.mimeTypes.textHtml)) ? consts.mimeTypes.textHtml : consts.mimeTypes.applicationCollectionJson;
    console.log(contentType);
    
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
