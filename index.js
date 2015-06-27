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

    countItems({
        wiki: 'enwiki',
        category: 'All free media',
        recurse: false, // TODO: recurse later
        global: false, // TODO: enable later
        globalExclude: [
            'commonswiki'
        ],
        target: freedom.free
    });

    countItems({
        wiki: 'enwiki',
        category: 'All non-free media',
        recurse: false, // TODO: recurse later
        global: false, // TODO: enable later
        globalExclude: [
            'commonswiki'
        ],
        target: freedom.unfree
    });

    // But what about https://en.wikipedia.org/wiki/Category:Wikipedia_free_files
    // and https://en.wikipedia.org/wiki/Category:Wikipedia_non-free_files ?
    // Which, incidentally, are the enwiki globals for the following two from Commons.

    countItems({
        wiki: 'commonswiki',
        category: 'Free licenses',
        recurse: false, // TODO: recurse later
        target: freedom.free
    });

    countItems({
        wiki: 'commonswiki',
        category: 'Unfree copyright statuses',
        recurse: true,
        target: freedom.unfree
    });
}
)()
