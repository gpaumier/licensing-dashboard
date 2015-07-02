'use strict';

/**
 * This module contains a suite of helpers to interact with the MediaWiki and Wikidata APIs.
 */

// Modules

var Q = require('q');
var mw = require('nodemw');
var wdk = require('wikidata-sdk');
var request = require('request');


/**
 * Create a mw object for a given wikiDB identifier.
 * @param {String} wikiDB   The identifier of the wiki we want to get a mw object for.
 * @param {Object} wikilist The dictionary containing information about Wikimedia wikis.
 * @return {Object}         A new mw object that corresponds to the given wikiDB identifier.
 */

function initializeWiki(wikiDB, wikilist) {

    return new mw({
        // Get URL from the wikilist and remove 'https://'
        server: wikilist[wikiDB]['url'].slice(8),
        path: '/w'
    });
}

exports.initializeWiki = initializeWiki;


/**
 * Query the MediaWiki API of a given wiki and get information about one or several of its categories.
 * @param {Object} wiki     A mw object representing the wiki.
 * @param {Array} titles    An array of strings representing the titles of the categories we seek information about.
 * @return {Promise}        A promise that contains the requested information if fulfilled.
 */

function getCategoryInfo(wiki, titles) {

    var queryParams = {
        action: 'query',
        prop: 'categoryinfo',
        titles: titles
    };

    var deferred = Q.defer();

    wiki.api.call(queryParams, function(error, info, next, data) {

        // TODO: handle 'next'

        if (error) {
            deferred.reject(new Error(error));
        } else  {
            deferred.resolve(info);
        }
    })

    return deferred.promise
    .then(function (info) {
        return [info.pages, wiki, titles];
    });
}

exports.getCategoryInfo = getCategoryInfo;

function testGetCategoryInfo(){
    var commonswiki = new mw({
        server: 'commons.wikimedia.org',
        path: '/w'
    });

    getCategoryInfo(commonswiki, 'Category:CC-BY-4.0')
    .then(function (result) {
        console.log(result);
    });
}

//testGetCategoryInfo();


/**
 * Query the MediaWiki API of a given wiki and get site statistics.
 * @param {Object} wiki     A mw object representing the wiki.
 * @return {Promise}        A promise that contains the requested information if fulfilled.
 */

function getSiteStatistics(wiki) {

    var queryParams = {
        action: 'query',
        meta: 'siteinfo',
        siprop: 'statistics'
    };

    var deferred = Q.defer();

    wiki.api.call(queryParams, function(error, info, next, data) {

        // TODO: handle 'next'

        if (error) {
            deferred.reject(new Error(error));
        } else  {
            deferred.resolve(info);
        }
    })

    return deferred.promise
    .then(function (info) {
        return info.statistics;
    });
}

exports.getSiteStatistics = getSiteStatistics;

function testGetSiteStatistics(){
    var commonswiki = new mw({
        server: 'commons.wikimedia.org',
        path: '/w'
    });

    getSiteStatistics(commonswiki)
    .then(function (result) {
        console.log(result);
    });
}

//testGetSiteStatistics();

/**
 * Query the Wikidata API get the sitelinks properties of a given Wikidata item.
 * @param {String} item     The Wikidata ID of the item we want sitelinks for.
 * @return {Promise}        A promise that contains an object with the requested sitelinks if fulfilled.
 */

function getWikidataSitelinksByID(item) {

    var wikidataQueryURL = wdk.getEntities([item], 'en', 'sitelinks', 'json');

    var deferred = Q.defer();

    request(wikidataQueryURL, function(error, response) {
        if (error) {
            deferred.reject(new Error(error));
        } else {
            deferred.resolve(response);
        }
    })

    return deferred.promise
    .then(function (response) {

        var entities = JSON.parse(response.body).entities;

        var siteLinks = entities[item]['sitelinks'];

        for (var site in siteLinks) {
            // clean up sitelinks to only keep the site ID and the title of the page
            siteLinks[site] = siteLinks[site]['title'];
        }

        return siteLinks;

    });
}

exports.getWikidataSitelinksByID = getWikidataSitelinksByID;

/**
 * Test this function manually, until we write some actual tests.
 */

function testGetWikidataSitelinksByID(){
    getWikidataSitelinksByID(['Q6310062'])
    .then(function (result) {
        console.log(result);
    });
}

//testGetWikidataSitelinksByID();
