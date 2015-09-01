var Spooky = require('spooky');
var spooky = new Spooky({
    casper: {
        logLevel: 'debug',
        verbose: true
    }
}, function (err) {
    var e;

    if (err) {
        e = new Error('Failed to initialize Spooky instance');
        e.details = err;
        throw e;
    }

    var x = 42;

    spooky.on('x-value', function (xVal) {
        console.log('\nspooky x is', x);
        console.log('casper x is', xVal);
    });

    spooky.on('counter', function (count) {
        console.log('The counter is now', count);
    });

    spooky.start('http://en.wikipedia.org/wiki/Spooky_the_Tuff_Little_Ghost');
    spooky.then([{x: x}, function () {
        // x is available in the scope of this function, but not globally

        // assign x + 1 to a global variable in casper's scope
        window.x = x + 1;

        x *= 2;
        this.emit('x-value', x);
    }]);
    spooky.then([{x: x}, function () {
        // not the same 'x' as the last call
        x /= 2;
        this.emit('x-value', x);
    }]);
    spooky.then([{x: x}, function () {
        // emit the global variable
        this.emit('x-value', window.x);
    }]);
    spooky.run();
});