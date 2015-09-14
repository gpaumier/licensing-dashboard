"use strict";

//var drawCharts = require('drawCharts');
var preprocess = require('preprocess');


var App = {
    init: function init() {
        console.log('App initialized.');
    },
    runCharts: function runCharts() {
        preprocess.preprocess('licensesOverTime.json');
    }
};

module.exports = App;
