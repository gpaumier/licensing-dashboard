
'use strict';

// Modules

var mw = require('nodemw');
var wdk = require('wikidata-sdk');
var request = require('request');
var getWikis = require('./getWikis')

//

function initializeWiki(wikis, wikiDB) {

    return new mw({
        // Get URL from list of wikis and remove 'https://'
        server: wikis[wikiDB]['url'].slice(8),
        path: '/w'
    });
}

function getCategoryInfo(wiki, titles, done) {

    var params = {
        action: 'query',
        prop: 'categoryinfo',
        titles: titles
    };

    wiki.api.call(params, function(err, info, next, data) {
        done(wiki, titles, info.pages);
    });
}


// Test query;
// API sandbox: https://commons.wikimedia.org/wiki/Special:ApiSandbox#action=query&prop=categoryinfo&format=json&titles=Category%3ACC-BY-4.0

//getCategoryInfo(commonswiki, 'Category:CC-BY-4.0');


function getSiteStatistics(wiki) {

    var params = {
        action: 'query',
        meta: 'siteinfo',
        siprop: 'statistics'
    };

    var count = 0;

    wiki.api.call(params, function(err, info, next, data) {
        console.log(info.statistics);
    });
}


// Test query; /w/api.php?action=query&meta=siteinfo&format=json&siprop=statistics
// API sandbox: https://commons.wikimedia.org/wiki/Special:ApiSandbox#action=query&prop=categoryinfo&format=json&titles=Category%3ACC-BY-4.0

//getSiteStatistics(commonswiki);

// For a given set of pages on a given wiki, get the Wikidata IDs of items
// https://commons.wikimedia.org/wiki/Special:ApiSandbox#action=query&prop=pageprops&format=json&titles=Category%3AFree%20licenses

function getWikidataIDFromPage(wiki, titles) {

    var params = {
        action: 'query',
        prop: 'pageprops',
        titles: titles
    };

    wiki.api.call(params, function(err, info, next, data) {

        for (var page in info.pages) {
            console.log(info.pages[page].pageprops.wikibase_item);
        };

    });
}

//getWikidataIDFromPage(commonswiki, 'Category:Free licenses')


// Get site links from Wikidata for given items

function getWikidataSitelinksByID(item, done) {

    var wikidataQueryURL = wdk.getEntities([item], 'en', 'sitelinks', 'json');

    request(wikidataQueryURL, function(err, response) {
        var entities = JSON.parse(response.body).entities;
        var siteLinks = entities[item]['sitelinks'];

        for (var site in siteLinks) {
            // clean up sitelinks to only keep the site ID and the title of the page
            siteLinks[site] = siteLinks[site]['title']
        }

        done(siteLinks);
    });
}

//getWikidataSitelinksByIDs(['Q6310062']);

function countItemsGlobal(params){

    if (params.recurse) {
        // TODO
    };

    getWikidataSitelinksByID([params.qItem], function (siteLinks) {

        for (var link in siteLinks){

            var wiki = initializeWiki(params.wikiList, link);

            getCategoryInfo(wiki, siteLinks[link], function (responseWiki, responseCategory, categoryInfo) {

                for (var result in categoryInfo) {

                    var localCount = categoryInfo[result]['categoryinfo']['files']

                    params.target += localCount;
                }

                console.log('Added ' + localCount + ' items from ' + responseWiki.server + ':' + responseCategory + '; target now ' + params.target);

            });
        };
    });


}


(function main(){

    /*
    One of the first things we need to do is get a list of Wikimedia wikis, so we have the information we need in order to query the wikis individually. Each wiki is identified by a unique key named after its database on the cluster.
    */

    getWikis.getWikis(function (wikiList){

        var freedom = {
            free: 0,
            unfree: 0,
            mixed: 0
        }

        /*
        On Wikimedia wikis, files are organized by copyright status according to two different schemes:

        * 'all (un)free media' and similar are all-encompassing flat categories that include all the files in a single category level.

        * 'Wikipedia (un)free files' and similar are hierarchical categories that sort files by license using subcategories, in many category levels.

        Files in flat categories are trivial to count. In hierarchical categories, we need to recurse into all the subcategories.

        Some wikis, like enwiki, combine both approaches so we need to make sure we don't count the files twice on those wikis. Since it's much easier to count membership of flat categories, that method should be preferred if both category structures are available.
        */

        countItemsGlobal({
            wikiList: wikiList,
            wiki: 'wikidatawiki',
            qItem: 'Q6380026', // 'Category:All free media'
            recurse: false, // Flat categories
            exclude: [],
            target: freedom.free
        });

        /*
        countItemsGlobal({
            wiki: 'wikidatawiki',
            qItem: 'Q6811831', // 'Category:All non-free media'
            recurse: false, // Flat categories
            globalExclude: [],
            target: freedom.unfree
        });

        countItemsGlobal({
            wiki: 'wikidatawiki',
            qItem: 'Q7142221', // 'Category:Wikipedia free files', but also includes [[c:Category:Free licenses]]
            recurse: true, // hierarchical categories
            target: freedom.free
        });

        countItemsGlobal({
            wiki: 'wikidatawiki',
            qItem: 'Q6805039', // 'Category:Wikipedia non-free files', but also includes [[c:Category:Unfree copyright statuses]]
            recurse: true,
            target: freedom.unfree
        });
        */

    })
}
)()
