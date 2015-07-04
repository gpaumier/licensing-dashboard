'use strict';

// Modules

var Q = require('q');
var mysql = require('mysql');

// Local files

var licenseList = require('./licenses');
var dbUtils = require('../dbUtils');
var config = require('../config');
var promiseUtils = require('../promiseUtils');


/**
 * Take a list of licenses (identified by license/rationale templates or categories, or other means) and get the number of files with that license that were uploaded in a given time window. This is done through database queries.
 *
 * Note: For a given img_name, the timestamp in the database is the one for the latest version uploaded, so this makes some results invalid. We should measure how many files had a new version uploaded outside the original time window, to determine how much this impacts the results.
 *
 * @param {Promise} licenses    A promise that, if fulfilled, contains an array of strings representing the title of license templates on Commons.
 * @return {Promise} A promise that, if fulfilled, contains an object with the distribution of licenses over time. The object is in the form { <template_name>: {<year>: <number of files>, ...}, ... }.
 */

function getLicensesByYear(licenses) {

    var result = {};

    // Prepare the licenses: strip them of the 'Template:' namespace prefix.

    for (var index in licenses) {
        licenses[index] = licenses[index].slice(9);
    }

    // Prepare the intervals we want for our temporal distribution. For now, let's use years because it's simpler, but later we'll probably want a little more granularity, e.g. by month.

    var intervals = [];

    for (var i = 2004; i < 2016; i++) {
        intervals.push(i);
    };

    // Prepare the database query.

    var connection = mysql.createConnection({
        host: 'commonswiki.labsdb',
        user: config.mysql.user,
        password: config.mysql.password,
        database: 'commonswiki_p'
    });

    var query = dbUtils.getQuery('/commons/licensesOverTime.sql');

    Q.ninvoke(connection, 'connect');

    /*
        for (var template of licenses) {
        for (var interval of intervals) {

        }
    }*/

    var doIContinue = true;

    return promiseUtils.promiseWhile(function () { return doIContinue; }, function () {

        doIContinue = false;
        result[licenses[0]] = {}

        var inserts = [intervals[11] + '%', licenses[0]];
        query = mysql.format(query, inserts);

        console.log(query);

        return Q.ninvoke(connection, 'query', query)
        .then(function (rows) {
            rows = rows[0][0]['count(page_title)'];
            console.log(rows);
            return rows;
        })
        .then(function (count) {
            result[licenses[0]][intervals[11]] = count;
        })
    })
    .then(function () {
        console.log(result);
        return result;
    })
    .fin(function closeConnection() {
        Q.ninvoke(connection, 'end')
    });
}


exports.getLicensesByYear = getLicensesByYear;


function testGetLicensesByYear () {
    return licenseList.getLicenses('Category:License_tags_for_transferred_copyright‎')
    .then(getLicensesByYear)
    .then(function (result) {
        console.log(result);
    })
    .done();
}


testGetLicensesByYear();
