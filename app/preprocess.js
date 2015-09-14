
/**
 * Things to do:
 * * Remove templates with no files in any year
 * * Filter with template blacklist (e.g. {{self}})
 * * Calculate the total number of files with each template
 *   * Get the top 10 / 100
 * * Define regular expressions to group templates by category: e.g. (cc-*|PD-CC-*) => Creative Commons
 * * Calculate the total number of template transclusion per year (for normalization). This isn't the total number of files since a file may transclude several templates.
 */

function preprocess(JSONFilename) {
    d3.json(JSONFilename, function processJSON (json) {

        console.log(json);

        var totals = {
            'byLicense': {},
            'byYear': {}
        };

        // Convert data to D3 maps, recursively

        var data = d3.map(json);
        data.forEach(function (license, years) {
            this.set(license, d3.map(years));
        });

        data.forEach(function (license, years) {
            totals['byLicense'][license] = d3.sum(years.values());
        })

        console.log(totals);
    });
}
module.exports.preprocess = preprocess;
