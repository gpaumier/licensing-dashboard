
'use strict';

// Modules

var mw = require('nodemw');
var wdk = require('wikidata-sdk');
var request = require('request');

//

var commonswiki = new mw({
    server: 'commons.wikimedia.org',
    path: '/w',
    debug: true
});

function getCategoryInfo(wiki, titles) {

    var params = {
        action: 'query',
        prop: 'categoryinfo',
        titles: titles
    };

    wiki.api.call(params, function(err, info, next, data) {

        for (var page in info.pages) {
            console.log(info.pages[page]);
        };

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

function getWikidataSitelinksByIDs(items) {

    var wikidataQueryURL = wdk.getEntities(items, 'en', 'sitelinks', 'json');

    request(wikidataQueryURL, function(err, response) {
        var entities = JSON.parse(response.body).entities;

        for (var item of items) {
            console.log(entities[item].sitelinks);
        };

    });
}

//getWikidataSitelinksByIDs(['Q6310062']);

function countItems(params){

}


(function main(){
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
        wiki: 'wikidatawiki',
        qItem: 'Q6380026', // 'Category:All free media'
        recurse: false, // Flat categories
        exclude: [],
        target: freedom.free
    });

    countItemsGlobal({
        wiki: 'wikidatawiki',
        qItem: 'Q6811831', // 'Category:All non-free media'
        recurse: false, // Flat categories
        globalExclude: [],
        target: freedom.unfree
    });

    countItemsGlobal({
        wiki: 'commonswiki',
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
}
)()
