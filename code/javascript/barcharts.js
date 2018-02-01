/*
  barcharts.js
  Minor programmeren; project
  Orin Habich 10689508

  Takes care of the barcharts in this project.
  This code is based on:
  https://bl.ocks.org/mbostock/3886208
*/

// colors for the barcharts
var colorsFirstAid = ["#fc8d59", "#d73027"];
var colorsComplaints = ["#fc8d59", "#4575b4", "#91bfdb", "#ffffbf",
  "#fee090"];
var colorsDamage = ["#fc8d59"];

function makeBarchart(svgID, data, perInjury, dataPie1, dataPie2, dataPie3,
  dataPie4, dataPM10, unit, nameY, colors, legend) {
  /*   Makes a stacked barchart.
       Args:
         svgID        The id of the svg for the barchart.
         data         The dataset for the barchart.
         perInjury    Dataset for the figure of human.
         dataPie1     Appriopiate dataset for piechart.
         dataPie2     Appriopiate dataset for piechart.
         dataPie3     Appriopiate dataset for piechart.
         dataPie4     Appriopiate dataset for piechart.
         dataPM10     The dataset for the linechart.
         unit         The unit on the y axis.
         nameY        The text for on the label along the y axis.
         colors       The set of colors for the bars.
         legend       Boolean to indicate if a legend should be added.
  */

  // put (properties of) svg in variables.
  var svg = d3.select("#svg" + svgID),
    margin = {top: 20, right: 100, bottom: 30, left: 60},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("id", "barchart" + svgID)
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // set the ranges
  var x = d3.scaleBand().rangeRound([0, width]).paddingInner(0.2).align(0.1);
  var y = d3.scaleLinear().rangeRound([height, 0]);
  var z = d3.scaleOrdinal().range(colors);

  var keys = data.columns.slice(1);

  x.domain(data.map(function(d) { return d.jaarwisseling; }));
  y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
  z.domain(keys);

  g.append("g")
    .selectAll("g")
    .data(d3.stack().keys(keys)(data))
    .enter()
    .append("g")
    .attr("fill", function(d) { return z(d.key); })
    .selectAll("rect")
    .data(function(d) { return d; })
    .enter()
    .append("rect")
    .attr("class", function(d) {
      return "newYearsEve" + d.data.jaarwisseling;
    })
    .attr("x", function(d) { return x(d.data.jaarwisseling); })
    .attr("y", function(d) { return y(d[1]); })
    .attr("height", function(d) { return y(d[0]) - y(d[1]); })
    .attr("width", x.bandwidth())
    .attr("opacity", 0.4)
    .on("mousemove", function(d) {

      // show tooltip if content not 0
      if (d[1] - d[0] != 0) {
        TOOLTIP.style("opacity", 1);
        TOOLTIP.html(d[1] - d[0] + unit)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
      };
      d3.select(this).style("stroke-width", 2).style("stroke", "black");
    })
    .on("mouseout", function() {

      // hide tooltip
      TOOLTIP.style("opacity", 0);
      d3.select(this).style("stroke-width", 0);
    })
    .on("click", function(d) {

      // set all rectangles semi-transparant except those in the legends
      d3.selectAll("rect").style("opacity", 0.4);
      d3.selectAll(".rectLegend").style("opacity", 1);

      // obtain x position
      var xPosition = d.data.jaarwisseling;

      // highlight chosen bar
      d3.selectAll(".newYearsEve" + xPosition).style("opacity", 1);

      // update the piecharts, linechart, titles and tooltip on human figure
      updatePiecharts(dataPie1, dataPie2, dataPie3, dataPie4, xPosition);
      updateLinechart(dataPM10[xPosition]);
      makeTitles(xPosition);
      tooltipFigureHuman(perInjury, xPosition);

      // keep choice in dropdown up-to-date
      d3.selectAll(".option").property("selected", false);
      d3.select("#y" + xPosition).property("selected", true);
    });

  // default selected bar
  d3.selectAll(".newYearsEve" + DEFAULTNEWYEARSEVE).attr("opacity", 1);

  // make x axis
  g.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .append("text")
    .attr("x", width + 4)
    .attr("dy", "0.2em")
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .text("Jaarwisseling");

  // make y axis
  g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("x", 2)
    .attr("y", y(y.ticks().pop()) + 0.5)
    .attr("dy", "0.2em")
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .text(nameY);

  // make legend if needed
  if (legend) {
    var legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(keys.slice().reverse())
      .enter().append("g")
      .attr("transform", function(d, i) {
        return "translate(0," + i * 20 + ")";
      });

    legend.append("rect")
      .attr("class", "rectLegend")
      .attr("x", width + 60)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z)
      .attr("opacity", 1);

    legend.append("text")
      .attr("x", width + 50)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });
  }
}
