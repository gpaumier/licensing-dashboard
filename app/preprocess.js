var drawCharts = require('drawCharts');

/**
 * Things to do:
 * * Remove templates with no files in any year
 * * Filter with template blacklist (e.g. {{self}})
 * * Calculate the total number of files with each template
 *   * Get the top 10 / 100
 * * Define regular expressions to group templates by category: e.g. (cc-*|PD-CC-*) => Creative Commons
 */

function preprocess(JSONFilename) {
    d3.json(JSONFilename, function processJSON (json) {

        console.log(json);

        var preprocessed = {
            'byLicense': {},
            'byYear': {},
            'unusedTemplates': []
        };

        // Convert data to D3 maps, recursively

        var data = d3.map(json);
        data.forEach(function (license, years) {
            this.set(license, d3.map(years));
        });

        // Calculate how many files have each license
        // Also remove templates with no transclusions

        preprocessed['uniqueTemplates'] = data.keys().length;

        data.forEach(function (license, years) {
            preprocessed['byLicense'][license] = d3.sum(years.values());
            if (!preprocessed['byLicense'][license]) {
                data.remove(license);
                preprocessed['unusedTemplates'].push(license);
            };
        });

        preprocessed['uniqueTranscludedTemplates'] = data.keys().length;
        preprocessed['licensesOverTime'] = data;

        // Calculate how many licenses are trancluded by files uploaded each year

        for (var year = 2004; year < 2016; year++) {
            preprocessed['byYear'][year] = 0;

            data.forEach(function (license, years) {
                preprocessed['byYear'][year] += years.get(year);
            });
        };

        drawCharts.drawAll(preprocessed);

    });
}
module.exports.preprocess = preprocess;
