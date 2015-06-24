'use strict';

// Modules

var mw = require('nodemw');

//

var commonswiki = new mw({
    server: 'commons.wikimedia.org',
    path: '/w',
    debug: true
});

function getFilesCountInCategory(wiki, category) {

    var params = {
        action: 'query',
        prop: 'categoryinfo',
        titles: 'Category:' + category
    };

    var count = 0;

    wiki.api.call(params, function(err, info, next, data) {

        var pages = info.pages;

        for (var page in pages) {
            count = pages[page].categoryinfo.files;
            console.log(count);
        };

    });
}


// Test query;
// API sandbox: https://commons.wikimedia.org/wiki/Special:ApiSandbox#action=query&prop=categoryinfo&format=json&titles=Category%3ACC-BY-4.0

getFilesCountInCategory(commonswiki, 'CC-BY-4.0');


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
