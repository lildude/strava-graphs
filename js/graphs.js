/* ----:[ Activity Calendar ]:---- */
// http://jsfiddle.net/3g3tusuq/
var width = 960,
    height = 136,
    cellSize = 17; // cell size

var day = function(d) { return (d.getDay() + 6) % 7; },
    week = d3.time.format("%W");
    format = d3.time.format("%Y-%m-%d"),
    parseDate = d3.time.format("%Y-%m-%dT%H:%M:%SZ").parse;

var color = d3.scale.quantize()
    .domain([0, 30])  // TODO: Make this dynamic and dependent on my longest run in the dataset
    .range(d3.range(5).map(function(d) { return "q" + d + "-5"; }));

var svg = d3.select("#activity-calendar").selectAll("svg")
    .data(d3.range(2015, 2016))
  .enter().append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "RdYlGn")
  .append("g")
    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

svg.append("text")
    .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text(function(d) { return d; });

var rect = svg.selectAll(".day")
    //.data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) { return week(d) * cellSize; })
    .attr("y", function(d) { return day(d) * cellSize; })
    .datum(format);

rect.append("title")
    .text(function(d) { return d; });

svg.selectAll(".month")
    .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("path")
    .attr("class", "month")
    .attr("d", monthPath);


//var url = "simple.json";
var url = "200.json";
d3.json(url, function(error, json) {
  if (error) return console.warn(error);

  var data = d3.nest()
    .key(function (d) {return format(parseDate(d.start_date_local));})
    .rollup(function (d) {return +d[0].distance/1000;})
    .map(json);

  rect.filter(function (d) {return d in data;})
    .attr("class", function (d) {return "day " + color(data[d]);})
    .select("title")
    .text(function (d) {return d + ": " + Math.round(data[d]) + "km";});

})

function monthPath(t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = +day(t0), w0 = +week(t0),
      d1 = +day(t1), w1 = +week(t1);
  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
      + "H" + w0 * cellSize + "V" + 7 * cellSize
      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
      + "H" + (w1 + 1) * cellSize + "V" + 0
      + "H" + (w0 + 1) * cellSize + "Z";
}
