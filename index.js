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

getWikidataSitelinksByIDs(['Q6310062']);
