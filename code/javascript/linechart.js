/*
  linechart.js
  Minor programmeren; project
  Orin Habich 10689508
  Takes care of the make- and update functions for the linechart in this project.
  Code is based on:
  https://bl.ocks.org/d3noob/402dd382a51a4f6eea487f9a35566de0
  http://bl.ocks.org/d3noob/7030f35b72de721622b8
*/

var parseTime = d3.timeParse("%Y-%m-%d %H:%M");
var bisectDate = d3.bisector(function(d) { return d.tijdstip; }).left;

function makeLinechart(dataPM10) {
  /*   Makes a linechart about PM10.
       Based on http://bl.ocks.org/d3noob/7030f35b72de721622b8
       Args:
         dataPM10     An appropriate dataset.
  */

  // pre-process data linechart
  for (var i = 0; i < NEWYEARSEVES.length; i++) {
    for (var j = 0; j < dataPM10[NEWYEARSEVES[i]].length; j++) {
      dataPM10[NEWYEARSEVES[i]][j].tijdstip =
      parseTime(dataPM10[NEWYEARSEVES[i]][j].tijdstip);
    }
  }

  var data = dataPM10[DEFAULTNEWYEARSEVE];

  var svgLinechart = d3.select("#svgLinechart");
  var margin = {top: 20, right: 0, bottom: 50, left: 60};
  var widthLinechart = +svgLinechart.attr("width") - margin.left - margin.right;
  var heightLinechart = +svgLinechart.attr("height") - margin.top - margin.bottom;
  var gLinechart = svgLinechart.append("g").attr("id", "linechart")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // set the ranges
  var x = d3.scaleTime().range([0, widthLinechart]);
  var y = d3.scaleLinear().range([heightLinechart, 0]);

  // define the axes
  var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%H:%M"));
  var yAxis = d3.axisLeft(y);

  // define the line
  var valueline = d3.line()
    .x(function(d) { return x(d.tijdstip); })
    .y(function(d) { return y(d.waarde); });

  // scale domain and range of data
  x.domain(d3.extent(data, function(d) { return d.tijdstip; }));
  y.domain([0, d3.max(data, function(d) { return d.waarde; })]);

  // Add the valueline path.
  gLinechart.append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("d", valueline(data));

  // make x axis
  gLinechart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + heightLinechart + ")")
    .call(xAxis);

  // make y axis
  gLinechart.append("g")
    .attr("class", "y axis")
    .call(yAxis);

  // text label for the x axis
  gLinechart.append("text")
    .attr("transform", "translate(" + (widthLinechart - 30) + " ," +
      (heightLinechart + margin.top + 20) + ")")
    .style("text-anchor", "middle")
    .text("Tijdstip");

  // text label for the y axis
  gLinechart.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (heightLinechart / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Waarde (\u03BCg/m\u00B3)");

  // make tooltip
  var tooltipLinechart = gLinechart.append("g")
    .attr("class", "tooltipLinechart");

  tooltipLinechart.append("line")
    .attr("class", "x-hover-line hover-line")
    .attr("y1", 0)
    .attr("y2", heightLinechart);

  tooltipLinechart.append("line")
    .attr("class", "y-hover-line hover-line")
    .attr("x1", widthLinechart)
    .attr("x2", widthLinechart);

  tooltipLinechart.append("circle")
    .attr("r", 7.5);

  tooltipLinechart.append("text")
    .attr("x", 15);

  svgLinechart.append("rect")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "overlay")
    .attr("width", widthLinechart)
    .attr("height", heightLinechart)
    .on("mouseover", function() { tooltipLinechart.style("display", null); })
    .on("mouseout", function() { tooltipLinechart.style("display", "none"); })
    .on("mousemove", mousemove);

  function mousemove() {
    /*   Takes care of the tooltip on the linechart when the mouse moves.
         Args: none
    */

    var x0 = x.invert(d3.mouse(this)[0]);
    var i = bisectDate(data, x0, 1);
    var d0 = data[i - 1];
    var d1 = data[i];
    var d = x0 - d0.tijdstip > d1.tijdstip - x0 ? d1 : d0;
      tooltipLinechart.attr("transform", "translate(" + x(d.tijdstip) + "," +
        y(d.waarde) + ")");
      tooltipLinechart.select("text")
        .text(function() { return d.waarde; });
      tooltipLinechart.select(".x-hover-line")
        .attr("y2", heightLinechart - y(d.waarde));
      tooltipLinechart.select(".y-hover-line")
        .attr("x2", widthLinechart + widthLinechart);
  }
}

function updateLinechart(data) {
  /*   Updates the linechart.
         Args:
          data    An appropriate dataset.
  */

  var svgLinechart = d3.select("#svgLinechart");
  var margin = {top: 20, right: 0, bottom: 50, left: 60};
  var widthLinechart = +svgLinechart.attr("width") - margin.left - margin.right;
  var heightLinechart = +svgLinechart.attr("height") - margin.top - margin.bottom;
  var gLinechart = svgLinechart.append("g").attr("id", "linechart")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // set the ranges
  var x = d3.scaleTime().range([0, widthLinechart]);
  var y = d3.scaleLinear().range([heightLinechart, 0]);

  // define the axes
  var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%H:%M"));
  var yAxis = d3.axisLeft(y);

  // define the line
  var valueline = d3.line()
    .x(function(d) { return x(d.tijdstip); })
    .y(function(d) { return y(d.waarde); });

  // scale domain and range of data
  x.domain(d3.extent(data, function(d) { return d.tijdstip; }));
  y.domain([0, d3.max(data, function(d) { return d.waarde; })]);

  // select the section we want to apply the changes to
  var gLinechart = d3.select("#svgLinechart").transition();

  // change the line
  gLinechart.select(".line")
    .duration(TIMEDURATION)
    .attr("d", valueline(data));

  // change the x axis
  gLinechart.select(".x.axis")
    .duration(0)
    .call(xAxis);

  // change the y axis
  gLinechart.select(".y.axis")
    .duration(TIMEDURATION)
    .call(yAxis);

  // add tooltip
  var tooltipLinechart = d3.select(".tooltipLinechart");

  d3.select(".overlay")
    .on("mouseover", function() { tooltipLinechart.style("display", null); })
    .on("mouseout", function() { tooltipLinechart.style("display", "none"); })
    .on("mousemove", mousemove);

  function mousemove() {
    /*   Takes care of the tooltip on the linechart when the mouse moves.
         Args: none
    */

  var x0 = x.invert(d3.mouse(this)[0]);
  var i = bisectDate(data, x0, 1);
  var d0 = data[i - 1];
  var d1 = data[i];
  var d = x0 - d0.tijdstip > d1.tijdstip - x0 ? d1 : d0;
    tooltipLinechart.attr("transform", "translate(" + x(d.tijdstip) + "," +
      y(d.waarde) + ")");
    tooltipLinechart.select("text").text(function() { return d.waarde; });
    tooltipLinechart.select(".x-hover-line")
      .attr("y2", heightLinechart - y(d.waarde));
    tooltipLinechart.select(".y-hover-line")
      .attr("x2", widthLinechart + widthLinechart);
  }
}
