'use strict';

/**
 * Get all the license templates from Commons
 */

var Q = require('q');
var mw = require('nodemw');
var apiUtils = require('../apiUtils');
var promiseUtils = require('../promiseUtils')

/**
 * Go through https://commons.wikimedia.org/wiki/Category:License_tags and collect all templates in that category and recursively through its subcategories.
 *
 * @return {Promise} A promise that contains an array of strings representing the title of the license templates we collected.
 */

function getLicenses() {

    var commonswiki = new mw({
        server: 'commons.wikimedia.org',
        path: '/w'
    });

    var templates = [];
    var categoriesToExplore = ['Category:License_tags']; // Parent category from which we recurse.

    // Blacklist: If/when we find those categories, we shouldn't recurse inside them because they're not actually licenses. Oh, the joys of a messy category tree.

    var categoryBlacklist = [
        'Category:Translated license tags', // Translations of licenses. Those aren't actual licenses.
        'Category:Redirects to license tags' // We only want the canonical templates, not their redirects.
    ];

    /**
     * Sort the pages we received from the API query into templates (what we want) and subcategories (what remains to be explored.
     * @param {Array} categoryMembers   Pages to sort. Pages are in the form { {Number} ns, {String} title }.
     */

    function sortCategoryMembers(categoryMembers) {
        for (var page of categoryMembers) {

            switch (page.ns) {

                case 10:
                    // The page is a template. Add it to the list of templates, unless it's already there.

                    if (templates.indexOf(page.title) == -1) {
                        templates.push(page.title);
                    }
                    break;

                case 14:
                    // The page is a category; add it to the list of categories to recurse into, unless it's in the blacklist.

                    if (categoryBlacklist.indexOf(page.title) == -1 ) {
                        categoriesToExplore.push(page.title);
                    };
                    break;
            };
        };
    }

    return promiseUtils.promiseWhile(function () { return categoriesToExplore.length }, function () {

        // Get the list of templates and categories in the top category

        return apiUtils.getCategoryMembers(
            commonswiki,
            categoriesToExplore.pop(),
            '10|14' // Templates and (sub)categories
        )

        // Save the templates, and add the subcategories to the next categories to explore

        .spread(function(categoryMembers, wiki) {

            sortCategoryMembers(categoryMembers);
            //console.log(templates, categoriesToExplore);
        })
    })
    .then(function () {
        return templates;
    });

}

function testGetLicenses() {
    return getLicenses()
    .then(function (result) {
        console.log(result);
    });
}

testGetLicenses();
