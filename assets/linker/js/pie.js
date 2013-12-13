$(document).ready(function() {
    $(route).hide();
    var data_route = String($(route).text());

    var width = 500,
    height = 500,
    radius = Math.min(width, height) / 2;

    var color = d3.scale.ordinal()
    .range(["#458B00", "#D80000", "#A80000", "#780000", "#480000"]);

    var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

    var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.count; });

    var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    d3.csv(data_route, function(error, data) {

        data.forEach(function(d) {
            d.count = +d.count;
        });

        var g = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

        g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color(d.data.answer_text); });

        g.append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.data.answer_text; });

    });
});
