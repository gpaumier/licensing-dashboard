var columnChart = require('columnChart');
//var overlappingColumnsChart = require('overlappingColumnsChart');
//var logColumnChart = require('logColumnChart');

function drawAll(preprocessed) {

    d3.select('#uniqueTemplates')
        .append('p')
        .text(preprocessed['uniqueTemplates']);

    d3.select('#uniqueTranscludedTemplates')
        .append('p')
        .text(preprocessed['uniqueTranscludedTemplates']);

    d3.select('#unusedTemplates')
        .append('p')
        .text(preprocessed['unusedTemplates'].join(', '));


    // Draw the charts

    columnChart.draw({
        'anchor': '#licensesOverTime',
        'dataset': preprocessed['licensesOverTime']
    });
};

module.exports.drawAll = drawAll;
