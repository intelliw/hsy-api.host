
/**
 * ./src/route/index.js
 * provides a hander for each route  
 */
module.exports = function (app) {

    const SUPPORTED_VERSIONS = 'v1.0 v1.1';
    
    let svc = require('../svc');                       // services
    
    // DEVTEST ROUTE  
    app.get('/devtest', (req, res) => {
        res.render('welcome', { user: "Any Oteh User?", title: "homepage" });
    });


    // API ROUTE [diagnostics.versions.get] /versions ---------------------------------
    app.all('/versions', (req, res) => {
        res
            .status(200)
            .json({ versions: SUPPORTED_VERSIONS })
            .end();
    });

    // API ROUTE [energy.type.get] /energy/{energy}/{period}/{epoch} --------------------
    app.get('/energy/:energy?/:period?/:epoch?/:number?', (req, res) => {

        let type = req.params.type;
        let period = req.params.period;
        let epoch = req.params.epoch;
        let num = req.params.number;
        let site = req.query.site;

        const params = require("./energy-params.js");

        let msg;

        type = !type ? 'hse' : type;
        period = (!period) ? 'now-period' : period;
        epoch = (!epoch) ? 'now-epoch' : epoch;
        num = (!num) ? 'num' : num;

        site = new params(11, 2, 3).getID();

        msg = type + ',' + period + ',' + epoch + ',' + num + ',' + site;

        res
            .status(200)
            .json({ message: msg })
            .end();


    // API ROUTE [devices.datasets.post] /devices/{device}/datasets/{dataset} ---------------

    // SECURITY
    app.get('/auth/info/googlejwt', svc.security.authInfoHandler);
    app.get('/auth/info/googleidtoken', svc.security.authInfoHandler);

    });


}