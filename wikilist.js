'use strict';

// Get a set of wikis based on a few parameters.
// Extracts the list of wikis from the Wikimedia Tool Labs metadata database (meta_p), and returns information about those wikis, to be used in another program; for example, in a program that iterates over a selection of wikis to perform a global analysis.


// Modules

var Q = require('q');
var mysql = require('mysql');
var fs = require('fs');

// Local files

var config = require('./config');

/**
 * Get a list of all Wikimedia wikis from the metadata table of the Tool Labs database.
 * @return {Promise} A promise that contains a dictionary of all Wikimedia wikis when fulfilled.
 */

function getWikis(){

    // Set up MySQL connection
    // The metadata database is available in all slices, so we use the alias for a small wiki, which is expected to be under less load than the slices used for bigger wikis.

    var connection = mysql.createConnection({
        host: 'kgwiki.labsdb',
        user: config.mysql.user,
        password: config.mysql.password,
        database: 'meta_p'
    });


    // Build the query
    // TODO later: make the query more specific based on the parameters given by the user (e.g. exclude closed wiki, only return wikis with VisualEditor, etc.)

    var query = 'SELECT * FROM wiki;';


    // Connect, query and close the connection when we're done

    Q.ninvoke(connection, 'connect');

    return Q.ninvoke(connection, 'query', query)
    .then(function cleanUpRows(rows) {

        // We got results for our query. Clean them up a bit before returning them.

        rows = rows[0];

        console.log('Received ' + rows.length + ' wikis.');

        var wikis = {};

        // convert the array to an object, using the dbnames as keys
        for (var wiki in rows) {
            wikis[rows[wiki]['dbname']] = rows[wiki];
        };

        return wikis;

    }, function giveFallbackWikilist() {

        // There was an problem while retrieving the wikilist from the database, so we're providing a fallback from our saved static version.

        var jsonFile = __dirname + '/wikilist.json'

        return Q.nfcall(fs.readFile, jsonFile, 'UTF-8')
        .then(function (value){
            return JSON.parse(value);
        }, function (err) {
            console.log(err);
            throw err;
        })
    })
    .fin(function closeConnection() {
        Q.ninvoke(connection, 'end')
    });
}

/**
 * Save the list of wikis to a local JSON file. This allows us to have a fallback in case we can't get an up-to-date version directly from the database.
 */

function saveWikilist(){
    getWikis()
    .then(function (value) {
        fs.writeFile('wikilist.json', JSON.stringify(value), function (err) {
            if (err) throw err;
            console.log('Wikilist saved.');
        });
    });
}

/**
 * Output the wikilist in the console. Useful for debugging. This should work whether we can get the list from the database or we're using our static fallback version.
 */

function showWikilist(){
    getWikis()
    .then(function (value){
        console.log(value);
    })
}

/**
 * Export the main function.
 */

exports.getWikis = getWikis;
