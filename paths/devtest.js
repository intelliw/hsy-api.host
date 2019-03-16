/**
 * ./route/energy.js
 * handlers for /energy path  
 */
const express = require('express');
const router = express.Router();

// DEVTEST ROUTE  ---------------------------------
router.get('/car', (req, res) => {

    let params = require('./energy-params.js');

    let site = new params.Group(11, 2, 3).getID();
    let car = params.createCar({ engine: '2.5L', trasmission: 'auto' });
    let bus = new params.Bus({ engine: '6.0L', trasmission: 'manual' });
    //let car = {engine: '2.0L', start: 'proximity'};

    res.render('welcome', { user: 'Any User?', title: 'homepage', car: car, bus: bus });

});

// SECURITY
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


module.exports.router = router;
