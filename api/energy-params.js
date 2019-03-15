/**
 * ./api/energy-params.js
 * validates parameters and returns a default value if the parameter was missing. 
 * throws an exception if the parameter was mandatory and missing.
 */

module.exports.Group = function (id, name, info) {
    var _id = id;
    var _name = name;
    var _info = info

    this.getID = function () {
        return _id;
    }

    this.getName = function () {
        return _name;
    }

    this.getInfo = function () {
        return _info;
    }
}

class Car {
    constructor(options) {
        this.engine = options.engine
        this.trasmission = options.trasmission
    }

    start() {
        this.engine.start()
    }
}

module.exports.createCar = function (options) {
    return new Car(options)
}

module.exports.Bus = class {
    constructor(options) {
        this.engine = options.engine
        this.trasmission = options.trasmission
    }

    start() {
        this.engine.start()
    }
}

