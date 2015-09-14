'use strict';

// Modules

var Q = require('q');
var wl = require('./wikilist');
var countFreedom = require('./freedom');

/**
 * Main program: Count files and pages on Wikimedia sites according to several dimensions.
 *
 * One of the first things we need to do, for any kind of count, is get a list of Wikimedia wikis, so we have the information we need in order to query the wikis individually. Each wiki is identified by a unique key named after its database on the cluster.
 *
 * Then, we start counting things.
 */


(function main(){

    wl.getWikis()
    .then(function (wikilist) {

        var tallies = {};

        return countFreedom.count(wikilist)
        .then(function (freedomTallies) {

            tallies['freedom'] = freedomTallies;
            return tallies;

        });
        // chain other counting functions here

    }, function (error) {
        console.log(error);
        throw error;
    });

})()
