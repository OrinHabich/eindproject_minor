/*
  piecharts.js
  Minor programmeren; project
  Orin Habich 10689508

  Takes care of the make- and update functions for the piecharts in this project.
  Code is based on:
  https://bl.ocks.org/santi698/f3685ca8a1a7f5be1967f39f367437c0
*/

// colors for the piecharts
var sixColors = d3.scaleOrdinal(["#91bfdb", "#4575b4", "#d73027", "#fc8d59",
  "#fee090", "#ffffbf"]);
var twoColors = d3.scaleOrdinal(["#91bfdb", "#4575b4"]);

var newYear;

function makePiecharts(dataPie1, dataPie2, dataPie3, dataPie4) {
  /*  Makes all the piecharts, for the default new years eve.
      Args:
        dataPie1    Appriopiate dataset.
        dataPie2    Appriopiate dataset.
        dataPie3    Appriopiate dataset.
        dataPie4    Appriopiate dataset.
  */

  newYear = DEFAULTNEWYEARSEVE;

  makePiechart("PerAge", dataPie1, "leeftijd", sixColors);
  makePiechart("PerBystander", dataPie2, "wie", twoColors);
  makePiechart("PerTypeFireworks", dataPie3, "type", twoColors);
  makePiechart("PerStatusFireworks", dataPie4, "status", twoColors);
}

function updatePiecharts(dataPie1, dataPie2, dataPie3, dataPie4, newYearsEve) {
  /*  Updates all the piecharts.
      Args:
        dataPie1        Appriopiate dataset.
        dataPie2        Appriopiate dataset.
        dataPie3        Appriopiate dataset.
        dataPie4        Appriopiate dataset.
        newYearsEve     The chosen new years eve.
  */

  newYear = newYearsEve;

  updatePiechart(dataPie1, "PerAge", newYearsEve, "leeftijd", sixColors);
  updatePiechart(dataPie2, "PerBystander", newYearsEve, "wie", twoColors);
  updatePiechart(dataPie3, "PerTypeFireworks", newYearsEve, "type", twoColors);
  updatePiechart(dataPie4, "PerStatusFireworks", newYearsEve, "status",
    twoColors);
}

function makePiechart(svgID, data, itemName, colors) {
  /*   Makes the piecharts.
       Args:
         svgID        The id of the svg for the piechart.
         data         The dataset for the piechart.
         itemName     The name of an item in the dataset.
         colors        The colors for the piechart.
  */

  var svg = d3.select("#svg" + svgID);
  var width = +svg.attr("width");
  var height = +svg.attr("height");
  var radius = Math.min(width, height) / 2 - 2;
  var g = svg.append("g").attr("id", "Piechart" + svgID).attr("transform",
      "translate(" + width / 2 + "," + height / 2 + ")");

  var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.number; });

  var path = d3.arc().outerRadius(radius).innerRadius(0);

  var arc = g.selectAll(".arc")
    .data(pie(data[DEFAULTNEWYEARSEVE]))
    .enter().append("g")
    .attr("class", "arc");

  var label = d3.arc().outerRadius(radius - 50).innerRadius(radius - 50);

  // create separate tooltip per piechart to have mutual independent opacities
  var tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .attr("id", "tooltip" + svgID)
      .style("opacity", 0);

  arc.append("path")
    .attr("d", path)
    .attr("fill", function(d) { return colors(d.data[itemName]); })
    .on("mousemove", function(d) {

      // only show tooltip if piechart is visible
      if (svg.style("opacity") == 0) {
        tooltip.style("opacity", 0);
      } else {
        tooltip.style("opacity", 1);
        d3.select(this).style("stroke-width", 2).style("stroke", "black");
        var total = 0;
        for (var i = 0; i < data[newYear].length; i++) {
          total += data[newYear][i].number;
        };
        var perc = Math.round(d.data.number / total * 100);
        tooltip.html(d.data.number + " mensen<br>" + perc + "&#37;")
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 40) + "px");
      }
    })
    .on("mouseout", function() {

      // hide tooltip
      tooltip.style("opacity", 0);
      d3.select(this).style("stroke-width", 0);
    });

  arc.append("text")
    .attr("transform", function(d) {
      return "translate(" + label.centroid(d) + ")";
    })
    .text(function(d) { return d.data[itemName]; });

  // by default piecharts are invisible, the checkboxes toggle the visibility
  d3.select("#" + svgID).style("display", "none");

}

function updatePiechart(data, svgID, newYearsEve, itemName, colors) {
  /*   Updates a piechart.
       Args:
        data          An appropriate dataset.
        svgID         The id of the svg for the piechart.
        newYearsEve   The chosen new years eve.
        itemName      The name of an item in the dataset.
        colors        The colors for the piechart.
  */

  var svg = d3.select("#svg" + svgID);
  var width = +svg.attr("width");
  var height = +svg.attr("height");
  var radius = Math.min(width, height) / 2 - 2;
  var g = d3.select("#Piechart" + svgID);

  var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.number; });

  var path = d3.arc().outerRadius(radius).innerRadius(0);

  var arc = g.selectAll(".arc")
    .data(pie(data[newYearsEve]));

  var label = d3.arc().outerRadius(radius - 50).innerRadius(radius - 50);

  arc.select("path").transition()
    .attr("d", path)
    .attr("fill", function(d) { return colors(d.data[itemName]); })
    .attrTween("d", arcTween)
    .duration(TIMEDURATION);

  arc.select("text").transition()
    .attr("transform", function(d) {
      return "translate(" + label.centroid(d) + ")";
    })
    .text(function(d) { return d.data[itemName]; })
    .duration(TIMEDURATION);

  function arcTween(a) {
    /*  Takes care of the path elements during the transition.
        Normal transition/tween functions to animate radial charts don't work.
        See https://stackoverflow.com/questions/21285385/d3-pie-chart-arc-is-invisible-in-transition-to-180
        for a good explanation. This function solves that problem and comes
        from https://bl.ocks.org/mbostock/1346410 (which turned out a usefull
        example after all.)
         Args:
          a       data
    */
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) { return path(i(t)); };
  }
}
