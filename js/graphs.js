/* ----:[ Activity Calendar ]:---- */
// http://jsfiddle.net/3g3tusuq/
var width = 960,
    height = 136,
    cellSize = 17, // cell size
    today = new Date(),
    lastyear = new Date();
    lastyear.setFullYear(lastyear.getFullYear() - 1);

var day = function(d) { return (d.getDay() + 6) % 7; },
    week = d3.time.format("%W"),
    year = d3.time.format("%Y"),
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
  //.append("g")  /* Padding for year label */
  //  .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

// Year label
/* svg.append("text")
    .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text(function(d) { return d; });
*/

// Month label
/* TODO
svg.append("text")
  .attr("class", "graph-label")
  .attr("x", function(d) { return 0; })
  .attr("y", function(d) { return -5; })
  .text("JAN FEB MAR APR MAY");
*/

// Draw out each day square
var rect = svg.selectAll(".day")
    //.data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .data(function(d) { return d3.time.days(lastyear, today); })
  .enter().append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    //.attr("x", function(d) { return week(d) * cellSize; })
    .attr("x", function(d) {
        var offset = 54 - +week(today);

        if (+week(d) <= +week(today) && +year(d) == +year(today))  {
            return ((+week(d) + offset) * cellSize) - (2 * cellSize);
        } else {
            return ((+week(d) + offset - 54) * cellSize);
        }
    })
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
*/

//var url = "simple.json";
var url = "200.json";
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
