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
// query: /w/api.php?action=query&prop=categoryinfo&format=json&titles=Category%3ACC-BY-4.0
// API sandbox: https://commons.wikimedia.org/wiki/Special:ApiSandbox#action=query&prop=categoryinfo&format=json&titles=Category%3ACC-BY-4.0

getFilesCountInCategory(commonswiki, 'CC-BY-4.0');
