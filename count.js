'use strict';

/**
 * This module contains tools to count stuff.
 */

// Modules

var Q = require('q');
var apiUtils = require('./apiUtils');

// Modules for testing only

var wl = require('./wikilist');


/**
 * Count the number of files in a category across wiki using the category's Wikidata ID.
 * @param {Object} params An object containing the parameters for the count.
 * @param {Object} params.wikilist An object serving as a dictionary that provides basic information about Wikimedia wikis.
 * @param {String} params.qItem The ID of the Wikidata Q item we're using as a starting point for the categories where to count.
 * @param {Boolean} params.recurse Whether we should recurse into subcategories for each category we're counting.
 * @param {Array} params.exclude A list of wikis to exclude from this count. Useful if we've already counted the files during another count. Wikis are strings containing the database ID of the wiki.
 * @return {Promise} A promise containing the result of the count if fulfilled. The result is an array in the form: [{Number} totalCount, [{String} countedWikis, ...] ]
 */

function countItemsGlobal(wikilist, params){

    if (params.recurse) {
        // TODO
    };

    return apiUtils.getWikidataSitelinksByID([params.qItem])
    .then(function (siteLinks) {

        var globalCountValues = [];

        for (var link in siteLinks){

            var wiki = apiUtils.initializeWiki(link, wikilist);

            var tmpCount = apiUtils.getCategoryInfo(wiki, siteLinks[link])
            .spread(function (categoryInfo, wiki, categories) {

                var localCount;

                for (var result in categoryInfo) {

                    localCount = categoryInfo[result]['categoryinfo']['files']
                }

                console.log('Added ' + localCount + ' items from ' + wiki.server + ':' + categories);

                return [localCount, wiki, categories];

            });

            globalCountValues.push(tmpCount);
        };

        // Check that all promises for local counts were fulfilled, and if so add all the local counts to get the global count

        return Q.all(globalCountValues)
        .then(function (globalCountValues) {

            var globalCount = 0;
            var countedWikis = [];

            for (var localSet of globalCountValues) {
                globalCount += localSet[0];
                countedWikis.push(localSet[1]);

            }

            return [globalCount, countedWikis];
        });
    });
}

exports.countItemsGlobal = countItemsGlobal;

function testCountItemsGlobal(){

    wl.getWikis()
    .then(function (wikilist) {

        return countItemsGlobal(
            wikilist,
            {
                qItem: 'Q6380026', // 'Category:All free media'
                recurse: false,
                exclude: []
            })

    })
    .then(function (result) {
        console.log(result);
    })
    .done();

}

// testCountItemsGlobal();
