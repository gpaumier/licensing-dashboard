(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var has = ({}).hasOwnProperty;

  var aliases = {};

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf('components/' === 0)) {
        start = 'components/'.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return 'components/' + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var expand = (function() {
    var reg = /^\.\.?(\/|$)/;
    return function(root, name) {
      var results = [], parts, part;
      parts = (reg.test(name) ? root + '/' + name : name).split('/');
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part === '..') {
          results.pop();
        } else if (part !== '.' && part !== '') {
          results.push(part);
        }
      }
      return results.join('/');
    };
  })();
  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  globals.require = require;
})();
require.register("application", function(exports, require, module) {
"use strict";

//var drawCharts = require('drawCharts');
var preprocess = require('preprocess');


var App = {
    init: function init() {
        console.log('App initialized.');
    },
    runCharts: function runCharts() {
        preprocess.preprocess('licensesOverTime.json');
    }
};

module.exports = App;

});

require.register("columnChart", function(exports, require, module) {
/**
 * Generates a column chart based on a set of parameters
 * @param params {Object}
 */

function draw (params) {

    // Define the chart's parameters

    var dataset = params.dataset;
    var barPadding = 1;
    var chartPadding = 30;
    var axisPadding = 20;
    var captionPadding = 20;

    var margin = {
        top: chartPadding + captionPadding,
        right: chartPadding,
        bottom: chartPadding + axisPadding + captionPadding,
        left:chartPadding + axisPadding
    }

    var chartHeight = 500 - margin.top - margin.bottom;
    var chartWidth = 800 - margin.left - margin.right;

    // Create the scales

    var xScale = params.xScale;

    var yScale = params.yScale;

    var domain = [
        d3.min(
            dataset,
            function (d, i) {
                return moment(d.key, 'YYYY-MM-DD')
            }
        ),
        d3.max(
            dataset,
            function (d, i) {
                return moment(d.key, 'YYYY-MM-DD')
            }
        )
    ];

    xScale
        .domain(domain)
        .range([0, chartWidth]);

    yScale
        .domain(
            [
                0,
                d3.max(
                    dataset,
                    function (d, i) {
                        return d.values;
                    }
                )
            ]
        )
        .range([chartHeight, 0]);

    // Set up the axes

    var xAxis = d3.svg.axis();

    var xFormatter = d3.format("f");
    var xFormatter2 = d3.format(".1f");

    xAxis
        .scale(xScale)
        .orient('bottom');

    var yAxis = d3.svg.axis();

    yAxis
        .scale(yScale)
        .orient('left')
        .ticks(5);

    var yRefLines = d3.svg.axis();

    yRefLines
        .scale(yScale)
        .orient('right')
        .ticks(5)
        .tickSize(chartWidth);

    // Add zoom behavior

    var zoom = d3.behavior.zoom()
        .on('zoom', redraw);

    zoom.x(xScale);

    function redraw() {
        gx.call(xAxis);
        gy.call(yAxis);
        bars
            .attr('x', function (d, i) {
                return xScale(moment(d.key, 'YYYY-MM-DD'));
            })
            .attr('width', Math.max(
                (chartWidth / domainExtent) * d3.event.scale - barPadding,
                2)
            )
    }

    // Create the chart

    var svg = d3.select(params.anchor).append('svg')
        .attr("width", chartWidth + margin.left + margin.right)
        .attr("height", chartHeight + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg.append("rect")
        .attr("class", "pane")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .call(zoom);

    // Create the bars

    var domainExtent = domain[1].diff(domain[0], 'days');

    var bars = svg
        .selectAll('rect')
        .data(dataset)
        .enter()
        .append('rect')
        .attr('x', function (d, i) {
            return xScale(moment(d.key, 'YYYY-MM-DD'));
        })
        .attr('y', function (d) {
            return yScale(d.values);
        })
        .attr('width', Math.max(
            chartWidth / domainExtent - barPadding,
            2)
        )
        .attr('height', function (d) {
            return chartHeight - yScale(d.values);
        })
        .attr("fill", "#1f78b4")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    // Create the tooltip and show/hide it on mouse over/out.

    var tooltip = d3.select(params.anchor).append("div")
        .attr("class", "tooltip")
        .style("opacity", 1e-6);

    function mouseover(d) {
        tooltip
            .style("opacity", 1)
            .text(d.values + ' events on ' + d.key)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 30) + "px");
    }

    function mouseout() {
        tooltip.style("opacity", 1e-6);
    }

    // Create the axes

    var gYRefLines = svg
        .append('g')
        .attr("class", "axis refLines")
        .call(yRefLines);

    gYRefLines.selectAll('g')
        .classed('minor', true);

    var gx = svg
        .append('g')
        .attr("class", "axis")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(xAxis);

    var gy = svg
        .append('g')
        .attr("class", "axis")
        .call(yAxis);

    // Create the captions of the axes

    // x axis

    svg
        .append('text')
        .text('Time')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + axisPadding + chartPadding)
        .attr('text-anchor', 'middle');

    // y axis

    svg
        .append('text')
        .text(params.yAxisLabel)
        .attr('x', 0)
        .attr('y', 0 - captionPadding)
        .attr('text-anchor', 'left');

}

module.exports.draw = draw;

});

require.register("drawCharts", function(exports, require, module) {
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

});

require.register("licensesOverTime", function(exports, require, module) {

});

;require.register("logColumnChart", function(exports, require, module) {
function draw(params) {
    // Define the chart's parameters

    console.log(params.dataset);

    var barPadding = 1;
    var chartPadding = 30;
    var axisPadding = 20;
    var captionPadding = 20;

    var margin = {
        top: chartPadding + captionPadding,
        right: chartPadding,
        bottom: chartPadding + axisPadding + captionPadding * 2,
        left:chartPadding + axisPadding
    }

    var chartHeight = 500 - margin.top - margin.bottom;
    var chartWidth = 800 - margin.left - margin.right;

    // Create the scales

    var xScale = d3.scale.log();

    var powExponent = 0.5;

    var yScale = d3.scale.pow().exponent(powExponent);

    xScale
        .domain(
            [
                1,
                d3.max(
                    params.dataset,
                    function (d) {
                        return d[0];
                    }
                )
            ]
        )
        .range([0, chartWidth]);

    yScale
        .domain(
            [
                0,
                d3.max(
                    params.dataset,
                    function (d) {
                        return d[1];
                    }
                )
            ]
        )
        .range([chartHeight, 0]);

    // Set up the axes

    var xAxis = d3.svg.axis();

    var xFormatter = d3.format("f");
    var xFormatter2 = d3.format(".1f");

    xAxis
        .scale(xScale)
        .orient('bottom')
        .ticks(10, function (d) {
            if (d < 30) {
                return xFormatter(d) + 'd';
            } else if (d < 365) {
                return xFormatter(d / 30) + 'm';
            } else {
                return xFormatter(d / 365) + 'y';
            }
        });

    var yAxis = d3.svg.axis();

    yAxis
        .scale(yScale)
        .orient('left')
        .ticks(5);

    var yRefLines = d3.svg.axis();

    yRefLines
        .scale(yScale)
        .orient('right')
        .ticks(5)
        .tickSize(chartWidth);

    // Create the chart

    var svg = d3.select(params.anchor).append('svg')
        .attr("width", chartWidth + margin.left + margin.right)
        .attr("height", chartHeight + margin.top + margin.bottom)
        .append('g')
        . attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Create the bars

    svg
        .selectAll('rect')
        .data(params.dataset)
        .enter()
        .append('rect')
        .attr('x', function (d, i) {
            return xScale(d[0] + 1);
        })
        .attr('y', function (d) {
            return yScale(d[1]);
        })
        .attr('width', chartWidth / params.dataset.length - barPadding)
        .attr('height', function (d) {
            return chartHeight - yScale(d[1]);
        })
        .attr("fill", "#1f78b4")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    // Create the tooltip and show/hide it on mouse over/out.

    var tooltip = d3.select(params.anchor).append("div")
        .attr("class", "tooltip")
        .style("opacity", 1e-6);

    function mouseover(d) {
        tooltip
            .style("opacity", 1)
            .text(d[1] + ' revert(s) happened to users on day ' + (d[0] + 1))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 30) + "px");
    }

    function mouseout() {
        tooltip.style("opacity", 1e-6);
    }

    // Create the axes

    var gYRefLines = svg
        .append('g')
        .attr("class", "axis refLines")
        .call(yRefLines);

    gYRefLines.selectAll('g')
        .classed('minor', true);

    var gx = svg
        .append('g')
        .attr("class", "axis")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(xAxis);

    var gy = svg
        .append('g')
        .attr("class", "axis")
        .call(yAxis);

    // Create the captions of the axes

    // x axis

    svg
        .append('text')
        .text('Nth day after user registration (logarithmic)')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + axisPadding + chartPadding)
        .attr('text-anchor', 'middle');

    svg
        .append('text')
        .text('(d: days; m: months; y: years)')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + axisPadding + chartPadding + captionPadding)
        .attr('text-anchor', 'middle');

    // y axis

    svg
        .append('text')
        .text('Number of reverts (scale ^' + powExponent + ')')
        .attr('x', 0)
        .attr('y', 0 - captionPadding)
        .attr('text-anchor', 'left');

};

module.exports.draw = draw;

});

require.register("preprocess", function(exports, require, module) {
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

});


//# sourceMappingURL=lida.js.map