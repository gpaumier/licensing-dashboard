'use strict';

// Get a set of wikis based on a few parameters.
// Extracts the list of wikis from the Wikimedia Tool Labs metadata database (meta_p), and returns information about those wikis, to be used in another program; for example, in a program that iterates over a selection of wikis to perform a global analysis.


// Modules

var mysql = require('mysql');


// Local files

var config = require('./config');


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

function getWikis(done){

    connection.connect(function(err) {
        if (err) throw err;
    });

    connection.query(query, function(err, rows, fields){
        if (err) throw err;
        console.log('Received ' + rows.length + ' wikis.');

        var wikis = {};

        for (var wiki in rows) {
            // convert the array to an object, using the dbnames as keys
            wikis[rows[wiki]['dbname']] = rows[wiki];
        };

        done(wikis);
    });

    connection.end(function(err) {
        if (err) throw err;
    });
}

//getWikis();

exports.getWikis = getWikis;
