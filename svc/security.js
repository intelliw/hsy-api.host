/**
 * ./svc/security.js
 * 
 * security functions
 */

module.exports = {
    authInfoHandler: authInfoHandler
}

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
