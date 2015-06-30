'use strict';

// Get a set of wikis based on a few parameters.
// Extracts the list of wikis from the Wikimedia Tool Labs metadata database (meta_p), and returns information about those wikis, to be used in another program; for example, in a program that iterates over a selection of wikis to perform a global analysis.


// Modules

var Q = require('q');
var mysql = require('mysql');

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

        rows = rows[0];

        console.log('Received ' + rows.length + ' wikis.');

        var wikis = {};

        // convert the array to an object, using the dbnames as keys
        for (var wiki in rows) {
            wikis[rows[wiki]['dbname']] = rows[wiki];
        };

        return wikis;

    })
    .fin(function closeConnection() {
        return Q.ninvoke(connection, 'end')
    });
}

getWikis()
.then(function (value) {
    console.log(value);
});

//exports.getWikis = getWikis;
