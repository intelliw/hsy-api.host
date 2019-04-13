//@ts-check
/**
 * ./requests/DevicesRequest.js
 * handlers for /devices path  
 * basepath /devices
 */
const express = require('express');
const router = express.Router();

const Request = require('../requests');

// [devices.datasets.post] ---------------
router.post('/datasets', (req, res, next) => {

    console.log(`BODY ${JSON.stringify(req.body)}`); //////////////////////////////  update portal docs to requrie content-type = app/json//// update validation to require content type - cannot be blank
    
    // request ---------------------
    let request = new Request.DevicesDatasetsPost(req);

    //  execute if valid
    let response = request.response;                            // execute the operation and return a response 
    let items = response.content;

    // response
    res
        .status(response.statusCode)
        .type(response.contentType)
        .render(response.view, {
            collections: items
        });

});

// [device.dataset.period.epoch.duration.get]
router.get(['/:device?/dataset/:dataset?',
    '/:device?/dataset/:dataset?/period/:period?',
    '/:device?/dataset/:dataset?/period/:period?/:epoch?/:duration?'],
    (req, res, next) => {

        // request ---------------------
        let request = new Request.DeviceDatasetGet(req);
        
        //  execute if valid
        let response = request.response;                            // execute the operation and return a response 
        let items = response.content;

        // response
        res
            .status(response.statusCode)
            .type(response.contentType)
            .render(response.view, {
                collections: items
            });

    });

// [devices.device.config.epoch.get] /devices/{device}/config/{epoch}
router.get('/:device?/config/:epoch?', (req, res, next) => {

    res
        .status(200)
        .json({ message: 'devices/config...' })
        .end();
});


module.exports = router;
