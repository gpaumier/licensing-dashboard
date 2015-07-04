'use strict';

// Modules

var Q = require('q');

/**
 * Run a Promise-returning function while a condition is met.
 * By https://stackoverflow.com/users/100172/stuart-k, from http://stackoverflow.com/a/17238793
 * @param {Function} condition  A Boolean-returning function. If the condition is true, the while loop runs.
 * @param {Function} body       A Promise-returning function.
 * @param {Promise} A promise that is fulfilled when the loop is completed.
 */

function promiseWhile(condition, body) {
    var done = Q.defer();

    function loop() {
        if (!condition()) return done.resolve();
        Q.when(body(), loop, done.reject);
    }

    Q.nextTick(loop);

    return done.promise;
}

exports.promiseWhile = promiseWhile;
