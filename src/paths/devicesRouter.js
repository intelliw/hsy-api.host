//@ts-check
/**
 * ./requests/DevicesRequest.js
 * handlers for /devices path  
 * basepath /devices
 */
const express = require('express');
const router = express.Router();

const Request = require('../requests');

/*  [devices.dataset.pms.post]
    [devices.dataset.mppt.post]
    [devices.dataset.inverter.post]
*/
router.post('/dataset/:dataset',
    (req, res, next) => {
        
        // request ---------------------                                
        let request = new Request.DevicesDatasetsPost(req);

        //  execute if valid
        let response = request.response;                                // execute the operation and return a response 
        let items = response.content;
        
        // response
        res
            .status(response.statusCode)
            .type(response.contentType)
            .render(response.view, {
                collections: items
            });

});

/* [device.dataset.period.epoch.duration.get]
    Returns device data for a period. 
    BTW     :XXX means it's a URL parameter. (i.e. req.params.XXX)
            ? means that the parameter is optional
*/
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


/* [devices.device.config.epoch.get] /devices/{device}/config/{epoch}
    Returns historical configuration data for a period, including identifiers of subitems 
    such as battery assembly, MCU board, and Mosfet board.
*/
router.get('/:device?/config/:epoch?', (req, res, next) => {

    res
        .status(200)
        .json({ message: 'devices/config...' })
        .end();
});


module.exports = router;
