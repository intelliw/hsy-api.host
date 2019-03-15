/**
 * ./api/route.js
 * handlers for each route  
 */
let svc = require('../svc');           // common services

module.exports.start = function(app) {

    // DEVTEST ROUTE  
    app.get('/devtest', (req, res) => {

        let params = require("./energy-params.js");
        
        let site = new params.Group(11, 2, 3).getID();
        let car = params.createCar({engine: "2.5L", trasmission: "auto"});
        let bus = new params.Bus({engine: "6.0L", trasmission: "manual"});
        //let car = {engine: "2.0L", start: "proximity"};

        res.render('welcome', { user: "Any User?", title: "homepage", car: car, bus:bus});
    });


    // API ROUTE [diagnostics.versions.get] /versions ---------------------------------
    app.all('/versions', (req, res) => {
        res
            .status(200)
            .json({ versions: svc.constant.SUPPORTED_VERSIONS })
            .end();
    });

    // API ROUTE [energy.type.get] /energy/{energy}/{period}/{epoch} --------------------
    app.get('/energy/:energy?/:period?/:epoch?/:number?', (req, res) => {

        let energy = req.params.energy;
        let period = req.params.period;
        let epoch = req.params.epoch;
        let num = req.params.number;

        let site = req.query.site;

        let msg;

        energy = !energy ? 'hse' : energy;
        period = (!period) ? 'now-period' : period;
        epoch = (!epoch) ? 'now-epoch' : epoch;
        num = (!num) ? 'num' : num;
        site = (!site) ? 'site' : site;

        msg = energy + ',' + period + ',' + epoch + ',' + num + ',' + site;

        res
            .status(200)
            .json({ message: msg })
            .end();
    });

    // API ROUTE [devices.datasets.post] /devices/{device}/datasets/{dataset} ---------------

    // SECURITY
    app.get('/auth/info/googlejwt', svc.security.authInfoHandler);
    app.get('/auth/info/googleidtoken', svc.security.authInfoHandler);

}