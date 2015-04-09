/* ----:[ Activity Calendar ]:---- */
// http://jsfiddle.net/3g3tusuq/3/
var margin = {top: 12, right: 0, bottom: 5, left: 0},
    width = 960 - margin.right - margin.left,
    height = 156 - margin.top - margin.bottom,
    cellSize = 17, // cell size
    today = new Date(),
    lastyear = new Date();
    lastyear.setFullYear(lastyear.getFullYear() - 1);

var day = function(d) { return (d.getDay() + 6) % 7; },
    week = d3.time.format("%W"),
    year = d3.time.format("%Y"),
    month = d3.time.format("%b"),
    format = d3.time.format("%Y-%m-%d"),
    parseDate = d3.time.format("%Y-%m-%dT%H:%M:%SZ").parse;

var color = d3.scale.quantize()
    .domain([0, 30])  // TODO: Make this dynamic and dependent on my longest run in the dataset
    .range(d3.range(5).map(function(d) { return "q" + d + "-5"; }));

var svg = d3.select("#activity-calendar").selectAll("svg")
    //.data(d3.range(2015, 2016)) // This doesn't need to be a range, just an array
    .data([1])  // An array with one element
  .enter().append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "RdYlGn")
    .append("g")  // Holds everything and pads for months labels
    .attr("transform", "translate(0," + (height - cellSize * 7 - 1) + ")");
    //.attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

// Year label
/* svg.append("text")
    .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text(function(d) { return d; });
*/

// Draw out each day square
var rect = svg.selectAll(".day")
    //.data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .data(function(d) { return d3.time.days(lastyear, today); })
  .enter().append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", xOffset)
    .attr("y", function(d) { return day(d) * cellSize; })
    .datum(format);


// Day tooltip
rect.append("title")
    .text(function(d) { return d; });

// Border around each month
/* svg.selectAll(".month")
    .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("path")
    .attr("class", "month")
    .attr("d", monthPath);

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
*/
// Month labels
svg.selectAll("text.month")
    .data(function(d) { return d3.time.months(lastyear, today); })
  .enter().append("text")
    .attr("class", "month")
    .attr("x", xOffset)
    .attr("y", -8)
    .text(month);

function xOffset(d) {
  var offset = 54 - +week(today);
  if (+week(d) <= +week(today) && +year(d) == +year(today))  {
      return ((+week(d) + offset) * cellSize) - (2 * cellSize);
  } else {
      return ((+week(d) + offset - 54) * cellSize);
  }
}

// Run `bin/get-entries.sh access_token` to populate this (because d3 doesn't do jsonp yet)
var url = "data/year-o-entries.json";
d3.json(url, function(error, json) {
  if (error) return console.warn(error);

  // Map the json data to date & distance
  var data = d3.nest()
    .key(function (d) {return format(parseDate(d.start_date_local));})
    .rollup(function (d) {var dist = 0;
        d.forEach(function(e) {
            dist += +e.distance;
        })
        return +dist/1000;
      })
    .map(json);

  // Each Day tooltip & colouring
  rect.filter(function (d) {return d in data;})
    .attr("class", function (d) {return "day " + color(data[d]);})
    .select("title")
    .text(function (d) {return d + ": " + Math.round(data[d]) + "km";});
})
