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
