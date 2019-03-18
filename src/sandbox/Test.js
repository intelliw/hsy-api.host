"use strict";

class Custom {
    constructor() {
        console.log("GOOD");
    }
}

class Foo extends Custom {
    constructor() {
        console.log("FOO");
        super();
    }
}

module.exports = Custom;
module.exports.Foo = Foo;