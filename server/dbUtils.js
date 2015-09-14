var fs = require('fs');

/**
 * Get the text of an SQL query from a file.
 *
 * @param {String} path The name of the file to read the query from, prefixed by the path relative to the project's directory, if appropriate.
 * @return {String} The content of the file.
 */

function getQuery(path) {
    return fs.readFileSync(__dirname + path, 'UTF-8');
}

exports.getQuery = getQuery;

function testGetQuery() {
    console.log(getQuery('/commons/licensesOverTime.sql'));
}

//testGetQuery();
