'use strict';

// Modules

var Q = require('q');
var mysql = require('mysql');
var fs = require('fs');

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

    // Prepare the licenses: strip them of the 'Template:' namespace prefix.

    for (var index in licenses) {
        licenses[index] = licenses[index].slice(9);
    }

    // Prepare the intervals we want for our temporal distribution. For now, let's use years because it's simpler, but later we'll probably want a little more granularity, e.g. by month.

    var intervals = [];

    for (var i = 2004; i < 2016; i++) {
        intervals.push(i);
    };

    // Prepare the database query

    var connection = mysql.createConnection({
        host: 'commonswiki.labsdb',
        user: config.mysql.user,
        password: config.mysql.password,
        database: 'commonswiki_p'
    });

    Q.ninvoke(connection, 'connect');

    // Initialize the recursion variables

    var emptyQuery = dbUtils.getQuery('/commons/licensesOverTime.sql');

    var endLicenseRecursion = licenses.length;
    var endIntervalRecursion = intervals.length;

    var licenseIndex = 0;
    var result = {};

    // Recurse through the list of licenses

    return promiseUtils.promiseWhile(function () { return licenseIndex < endLicenseRecursion; }, function () {

        var license = licenses[licenseIndex].replace(/ /g, '_'); // https://phabricator.wikimedia.org/P879#4143

        licenseIndex += 1;
        result[license] = {};

        var intervalIndex = 0;

        // Recurse through the intervals

        return promiseUtils.promiseWhile(function () { return intervalIndex < endIntervalRecursion; }, function () {

            var interval = intervals[intervalIndex];
            intervalIndex += 1;

            // Build the SQL query for this interval and this template

            var inserts = [interval + '%', license];
            var query = mysql.format(emptyQuery, inserts);

            // Run the SQL query for this interval and this template

            return Q.ninvoke(connection, 'query', query)
            .then(function (rows) {
                rows = rows[0][0]['count(page_title)'];
                return rows;
            })

            // Save the count for this interval and this template into the master 'result'

            .then(function (count) {
                result[license][interval] = count;
            });
        });
    })
    .then(function () {
        return result;
    })

    // We're all done with the SQL queries; close the connection.

    .fin(function closeConnection() {
        Q.ninvoke(connection, 'end');
    });
}


exports.getLicensesByYear = getLicensesByYear;


function testGetLicensesByYear() {
    return licenseList.getLicenses('Category:License_tags_for_transferred_copyright‎')
    .then(getLicensesByYear)
    .then(function (result) {
        console.log(result);
    })
    .done();
}


// testGetLicensesByYear();

function allLicensesByYearToJSON() {
    return licenseList.getLicenses('Category:License_tags')
    .then(getLicensesByYear)
    .then(function (result) {
        return fs.writeFileSync('commons/licensesOverTime.json', JSON.stringify(result), 'UTF-8');
    })
    .done();
}

allLicensesByYearToJSON()
