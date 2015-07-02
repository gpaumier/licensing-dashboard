'use strict';

// Modules

var Q = require('q');
var cnt = require('./count');
var api = require('./apiUtils')

// Modules for testing only

var wl = require('./wikilist');


/**
 *  Count the number of free and unfree files across Wikimedia wikis.
 *
 * On Wikimedia wikis, files are organized by copyright status according to two different schemes:
 *
 * - 'all (un)free media' and similar are all-encompassing flat categories that include all the files in a single category level.
 *
 * - 'Wikipedia (un)free files' and similar are hierarchical categories that sort files by license using subcategories, in many category levels.
 *
 * Files in flat categories are trivial to count. In hierarchical categories, we need to recurse into all the subcategories.
 *
 * Some wikis, like enwiki, combine both approaches so we need to make sure we don't count the files twice on those wikis. Since it's much easier to count membership of flat categories, that method should be preferred if both category structures are available. Therefore, we ought to count flat categories before their hierarchical counterparts.
 *
 * @param {Promise} wikilist A promise that contains the dictionary of Wikimedia wikis
 * @param {Promise} tallies A promise that contains the current tallies.
 * @return {Promise} A promise that, if fulfilled, contains an array with the dictionary of Wikimedia wikis (untouched), and updated tallies.
 */

function count(wikilist) {

    var freedom = {
        free: {
            count: 0,
            countedWikis: []
        },
        unfree: {
            count: 0,
            countedWikis: []
        },
        mixed: {
            count: 0,
            countedWikis: []
        }
    };

    // Count the number of free files in flat categories across wiki, and add it to the 'free' tally

    return cnt.countItemsGlobal(
        wikilist,
        {
            qItem: 'Q6380026', // 'Category:All free media'
            recurse: false,
            exclude: []
        })
    .spread(function (globalCount, countedWikis) {
        freedom['free']['count'] += globalCount;
        freedom['free']['countedWikis'] = freedom['free']['countedWikis'].concat(countedWikis);
        return freedom;
    })



}

exports.count = count;

function testCount(){

    wl.getWikis()
    .then(function (wikilist) {
        return count(wikilist)})
    .then(function (result) {
        console.log(result);
    })
    .done();

}

// testCount();
