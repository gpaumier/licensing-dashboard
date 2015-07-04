'use strict';

/**
 * Get license templates from Commons
 */

var Q = require('q');
var mw = require('nodemw');
var apiUtils = require('../apiUtils');
var promiseUtils = require('../promiseUtils')

/**
 * Go through a category of license templates, and collect all templates in that category and recursively through its subcategories.
 *
 * @param {String} parentCategory   The top category from which we start exploring. In most cases, this will be 'Category:License_tags', but in some cases we might want to start somewhere else (e.g. start from a low-level category to get a reduced number of license tags, if we're debugging and don't actually need the full list). This must include the 'Category:' prefix.
 * @return {Promise} A promise that contains an array of strings representing the title of the license templates we collected.
 */

function getLicenses(parentCategory) {

    var commonswiki = new mw({
        server: 'commons.wikimedia.org',
        path: '/w'
    });

    var templates = [];
    var categoriesToExplore = [parentCategory]; // Parent category from which we recurse.

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
        return templates.sort();
    });

}

exports.getLicenses = getLicenses;

/**
 * Simple test function until we write some proper automated tests
 */

function testGetLicenses() {
    //return getLicenses('Category:License_tags')
    return getLicenses('Category:License_tags_for_transferred_copyright‎')
    .then(function (result) {
        console.log(result);
    });
}

//testGetLicenses();

/**
 * Get the list of licenses from Commons, and only keep those that are a subpage (i.e. they have a '/' in their name). This is mostly for maintenance, as those are probably false positives. Identifying them is a prerequisite to then assessing and fixing them on Commons.
 */

function printSubpageLicenses() {
    return getLicenses()
    .then(function (result) {

        for (var template of result) {
            if (template.indexOf('/') != -1) {
                console.log(template);
            };
        };
    });
}

// printSubpageLicenses();
