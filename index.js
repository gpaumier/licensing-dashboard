'use strict';

// Modules

var mw = require('nodemw');

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

getCategoryInfo(commonswiki, 'Category:CC-BY-4.0');


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

getSiteStatistics(commonswiki);
