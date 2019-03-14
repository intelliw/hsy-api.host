/**
  * PACKAGE
 * ./api/route/index.js
 * 
 * handlers for each route  
 */
let svc = require('../svc');

module.exports = {
    start: start
}

function start(app) {

    

    // DEVTEST ROUTE  
    app.get('/devtest', (req, res) => {
        res.render('welcome', { user: "Any User?", title: "homepage" });
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

        let params = require("./energy-params.js");
        site = new params(11, 2, 3).getID();

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