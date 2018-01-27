var newYearsEves = ["2014-2015", "2015-2016", "2016-2017", "2017-2018"];
var defaultNewYearsEve = newYearsEves[newYearsEves.length - 1];
var timeDuration = 1000;

//var colorsAge = d3.scaleOrdinal(d3.schemeCategory10);
//var colorsPie2Slices = d3.scaleOrdinal(["#A9A9A9", "#BDB76B"]);
var colorsPie2Slices = d3.scaleOrdinal(["#91bfdb", "#4575b4"]);
var colorsAge = d3.scaleOrdinal(["#91bfdb", "#4575b4", "#d73027", "#fc8d59", "#fee090", "#ffffbf"]);

function makePiecharts(perAge, perBystander, perTypeFireworks, perStatusFireworks) {
  makePiechart("PerAge", perAge, "leeftijd", colorsAge);
  makePiechart("PerBystander", perBystander, "wie", colorsPie2Slices);
  makePiechart("PerTypeFireworks", perTypeFireworks, "type", colorsPie2Slices);
  makePiechart("PerStatusFireworks", perStatusFireworks, "status", colorsPie2Slices);
}

function updatePiecharts(perAge, perBystander, perTypeFireworks,
  perStatusFireworks, newYearsEve) {
  /*   Makes the piecharts.
       Args:
         newYearsEve      The chosen new years eve.
         dataPiecharts    The datasets for the piecharts.
         firstTime        Boolean, to indicate if it is the first time this
                          function is called.
  */

  updatePiechart(perAge, "PerAge", newYearsEve, "leeftijd", colorsAge);
  updatePiechart(perBystander, "PerBystander",newYearsEve , "wie", colorsPie2Slices);
  updatePiechart(perTypeFireworks, "PerTypeFireworks", newYearsEve, "type", colorsPie2Slices);
  updatePiechart(perStatusFireworks, "PerStatusFireworks", newYearsEve,
    "status", colorsPie2Slices);
}

function makePiechart(svgID, data, itemName, colors) {
  /*   Makes the piecharts.
       Args:
         svgID        The id of the svg for the piechart.
         data         The dataset for the piechart.
         itemName     The name of an item in the dataset.
         colors        The colors for the piechart.
  */

  var svg = d3.select("#svg" + svgID),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    radius = Math.min(width, height) / 2 - 2,
    g = svg.append("g").attr("id", "Piechart" + svgID).attr("transform",
      "translate(" + width / 2 + "," + height / 2 + ")");

  var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.number; });

  var path = d3.arc().outerRadius(radius).innerRadius(0);

  var arc = g.selectAll(".arc")
    .data(pie(data[defaultNewYearsEve]))
    .enter().append("g")
    .attr("class", "arc");

  var label = d3.arc().outerRadius(radius - 40).innerRadius(radius - 50);

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
      if (svg.style("opacity") == 0) {
        tooltip.style("opacity", 0);
      } else {
        tooltip.style("opacity", 1);
        d3.select(this).style("stroke-width", 2).style("stroke", "black");
      }
      tooltip.html(d.data.number + " mensen" )
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
      tooltip.style("opacity", 0);
      d3.select(this).style("stroke-width", 0);
    });

  arc.append("text")
    .attr("transform", function(d) {
      return "translate(" + label.centroid(d) + ")";
    })
    .text(function(d) { return d.data[itemName]; });

  // by default piecharts are invisible, the checkboxes toggle the visibility
  svg.style("opacity", 0);

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

  var svg = d3.select("#svg" + svgID),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    radius = Math.min(width, height) / 2 - 2,
    g = d3.select("#Piechart" + svgID);

  var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.number; });

  var path = d3.arc().outerRadius(radius).innerRadius(0);

  var arc = g.selectAll(".arc")
    .data(pie(data[newYearsEve]));

  var label = d3.arc().outerRadius(radius - 40).innerRadius(radius - 50);

  arc.select("path").transition()
    .attr("d", path)
    .attr("fill", function(d) { return colors(d.data[itemName]); })
    .attrTween("d", arcTween)
    .duration(timeDuration);

  arc.select("text").transition()
    .attr("transform", function(d) {
      return "translate(" + label.centroid(d) + ")";
    })
    .text(function(d) { return d.data[itemName]; })
    .duration(timeDuration);

  function arcTween(a) {
    /*  Takes care of the path elements during the transition.
        Normal transition/tween functions to animate radial charts don't work.
        See https://stackoverflow.com/questions/21285385/d3-pie-chart-arc-is-invisible-in-transition-to-180
        for a good explanation. This function solves that problem and comes
        from https://bl.ocks.org/mbostock/1346410 (which turned out a usefull
        example after all.)
         Args:
          a       <?>
    */
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) { return path(i(t)); };
  }
}
