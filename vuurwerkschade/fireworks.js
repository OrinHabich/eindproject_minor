/*
  fireworks.js
  Minor programmeren; Project
  Orin Habich 10689508

  line chart:   https://bl.ocks.org/d3noob/402dd382a51a4f6eea487f9a35566de0
  update linechart met buttonpress http://bl.ocks.org/d3noob/7030f35b72de721622b8

  voor de dropdown stylen: https://www.w3schools.com/howto/howto_custom_select.asp
*/

window.onload = afterLoad;

function afterLoad() {
  /*  This executes the whole script,
      but it is called only when the window is loaded.
      Args: none.
  */

//     d3.xml("images/figureHuman.svg").mimeType("image/svg+xml").get(function(error, xml) {
//   if (error) throw error;
//   d3.select("#figureHuman").appendChild(xml.documentElement);
// });

  var defaultNewYearsEve = "2017-2018";

  /* Define the div for the tooltip over barcharts and piecharts.
     Note that there is a separate tooltip for the figure of the human body.
  */
  var div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  //-------COLOR ARRAYS FOR THE BARCHARTS---------------------------------------
  var colorsFirstAid  = ["#A9A9A9", "#BDB76B"];
  var colorsComplaints = ["#B8860B", "#EE82EE", "	#F5DEB3", "#9ACD32",
    "#C0C0C0"];
  var colorsDamage = ["#B8860B", "#EE82EE", "	#F5DEB3", "#9ACD32", "#C0C0C0"];

  //-------VARIABELS FOR THE LINECHART------------------------------------------
  var svgLinechart = d3.select("#svgLinechart"),
    margin = {top: 20, right: 100, bottom: 50, left: 50},
    widthLinechart = +svgLinechart .attr("width") - margin.left - margin.right,
    heightLinechart = +svgLinechart .attr("height") - margin.top - margin.bottom,
    gLinechart = svgLinechart .append("g").attr("id", "linechart")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // parse the time
  var parseTime = d3.timeParse("%Y-%m-%d %H:%M");
  var bisectDate = d3.bisector(function(d) { return d.tijdstip; }).left;

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

  //--------LOAD DATA---------------------------------------------------------
  queue()
    .defer(d3.csv, "data/FirstAid.csv", function(d, i, columns) {
      for (i = 1, t = 0; i < columns.length; ++i) {
        t += d[columns[i]] = +d[columns[i]];
      }
      d.total = t;
      return d;
    })
    .defer(d3.csv, "data/complaints.csv", function(d, i, columns) {
      for (i = 1, t = 0; i < columns.length; ++i) {
        t += d[columns[i]] = +d[columns[i]];
      }
      d.total = t;
      return d;
    })
    .defer(d3.csv, "data/damage.csv", function(d, i, columns) {
      for (i = 1, t = 0; i < columns.length; ++i) {
        t += d[columns[i]] = +d[columns[i]];
      }
      d.total = t;
      return d;
    })
    .defer(d3.json, "data/FirstAidperAge.json")
    .defer(d3.json, "data/FirstAidBystander.json")
    .defer(d3.json, "data/FirstAidperTypeFireworks.json")
    .defer(d3.json, "data/FirstAidperStatusFireworks.json")
    .defer(d3.json, "data/FirstAidperInjury.json")
    .defer(d3.json, "data/pm10.json")

    .await(main);

    function main(error, dataFirstAid, dataComplaints, dataDamage, perAge,
      perBystander, perTypeFireworks, perStatusFireworks, perInjury, dataPM10) {
      /*   Creates charts based on the given data.
           Args:
           error        Boolean, true if error, false otherwise.
           all others   Appriopiate datasets.
      */

      if (error) throw error;

      // put together datasets for first aid section
      var dataPiecharts = [perAge, perBystander, perTypeFireworks,
        perStatusFireworks];

      // make the barcharts
      makeBarchart("svgFirstAid", dataFirstAid, dataPiecharts, dataPM10,
        " mensen", "Aantal", colorsFirstAid);
      makeBarchart("svgComplaints", dataComplaints, dataPiecharts, dataPM10,
        " klachten", "Aantal", colorsComplaints);
      makeBarchart("svgDamage", dataDamage, dataPiecharts, dataPM10,
        " miljoen euro", "Euro (in miljoenen)", colorsDamage);

      // make default pie charts, linechart and titles
      makePiecharts(defaultNewYearsEve, dataPiecharts, true);
      makeLinechart(dataPM10);
      makeTitels(defaultNewYearsEve);

      // add tooltip to the figure of human
      addTooltip(perInjury, defaultNewYearsEve);

      // make the dropdown menu (including functionality)
      makeDropdown(dataFirstAid, perInjury, dataPiecharts, dataPM10);

      // let checkboxes toggle opacity of piecharts
      //d3.selectAll(".checkbox").property("checked", true);
      d3.select("#checkbox1").on("change", togglePiechartPerAge);
      d3.select("#checkbox2").on("change", togglePiechartType);
      d3.select("#checkbox3").on("change", togglePiechartBystander);
      d3.select("#checkbox4").on("change", togglePiechartStatus);
  };

  //--------FUNCTIONS-----------------------------------------------------------
  function makeDropdown(dataFirstAid, perInjury, dataPiecharts, dataPM10) {
    /*   Updates site after selection in dropdown menu changes.
         Note: The actual funcionality is in onchange().
         Args:
           firstAid               Dataset to extract options from.
           perInjury              Dataset of the barchart about first aid.
           dataPiechartsAndHuman  Array with datasets for piecharts and
                                  figure of the human.
           dataPM10               Dataset for linechart.
    */

    var select = d3.select("#chooseYear")
      .append("select")
      .attr("class","select")
      .on("change", onchange);

    var options = select
      .selectAll("option")
      .data(dataFirstAid)
      .enter()
      .append("option")
      .attr("id", function(d) { return "#y" + d.jaarwisseling; })
      .text(function (d) { return d.jaarwisseling; });

    // attempt to have most recent shown by default
    d3.select("#y" + defaultNewYearsEve).property("selected", true);

    function onchange() {
      /*   Updates site after selection in dropdown menu changes.
           This function is defined and called from onchangeDropdown().
           This function makes the actual changes.
           Args:  None.
      */

      // results of selecting with dropdown menu
      var selectValue = d3.select("select").property("value");

      // update the piecharts, linechart, titles and tooltip on the human figure
      makePiecharts(selectValue, dataPiecharts);
      updateLinechart(dataPM10[selectValue]);
      makeTitels(selectValue);
      addTooltip(perInjury, selectValue);

      // highlight in all bargraphs the bar corresponding to selection
      d3.selectAll("rect").attr("opacity", 0.4);
      d3.selectAll(".newYearsEve" + selectValue).attr("opacity", 1);
    };
  };


  function addTooltip(data, newYearsEve) {
    /*   Adds a tooltip to the figure of the human body.
         Args:
           data         Dataset of injuries.
           newYearsEve  Chosen new years eve.
    */

    // tooltip on eyes of figure of human
    d3.select("#eye")
      .datum(data[newYearsEve])
      .on("mousemove",  function(d) {
        div.transition()
          .duration(5)
          .style("opacity", 1);
        div.html("Letsel aan ogen bij " + d.eye + " " +
          plural(d.eye, "persoon") + ".<br>Hierbij waren<br>" +
          d.zichtsverlies + " " + plural(d.zichtsverlies, "oog")  +
          " met zichtsverlies,<br>" + d.blind + " " + plural(d.blind, "oog")  +
          " werden blind en<br>" + d.verwijderd + " " +
          plural(d.verwijderd, "oog") + " " + plural(d.verwijderd, "werd")  +
          " verwijderd.")
          .style("left", (d3.event.pageX + 20) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
        })
      .on("mouseout", function(d) {
        div.transition()
          .duration(5)
          .style("opacity", 0);
        });

    // tooltip on heart of figure of human
    d3.select("#heart")
      .datum(data[newYearsEve])
      .on("mousemove",  function(d, i) {
        div.style("opacity", 1);
        div.html(d.heart + " " + plural(d.heart,"persoon") +
          " overleden<br>" + d.whatHappened)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        div.style("opacity", 0);
      });

// tooltips for other bodyparts of
var bodyparts = ["head", "body", "arm", "hand", "leg"];

// for (var i = 0; i < bodyparts.length; i++) {
//    d3.select("#" + bodyparts[i])
//      .datum(data[newYearsEve])
//      .on("mousemove",  function(d, i) {
//     div.transition()
//         .duration(5)
//         .style("opacity", 1);
//     div.html(d[bodyparts[i]] + " mensen")
//       .style("left", (d3.event.pageX) + "px")
//       .style("top", (d3.event.pageY - 28) + "px");
//    })
//    .on("mouseout", function(d) {
//        div.transition()
//            .duration(5)
//            .style("opacity", 0);
//    });

d3.select("#head")
.datum(data[newYearsEve])
.on("mousemove",  function(d, i) {
div.transition()
.duration(5)
.style("opacity", 1);
div.html(d["head"] + " " + plural(d["head"],"persoon"))
.style("left", (d3.event.pageX) + "px")
.style("top", (d3.event.pageY - 28) + "px");
})
.on("mouseout", function(d) {
div.transition()
.duration(5)
.style("opacity", 0);
});

d3.select("#body")
.datum(data[newYearsEve])
.on("mousemove",  function(d, i) {
div.transition()
.duration(5)
.style("opacity", 1);
div.html(d["body"] + " " + plural(d["body"],"persoon"))
.style("left", (d3.event.pageX) + "px")
.style("top", (d3.event.pageY - 28) + "px");
})
.on("mouseout", function(d) {
div.transition()
.duration(5)
.style("opacity", 0);
});

d3.select("#arm")
.datum(data[newYearsEve])
.on("mousemove",  function(d, i) {
div.transition()
.duration(5)
.style("opacity", 1);
div.html(d["arm"] + " " + plural(d["arm"],"persoon"))
.style("left", (d3.event.pageX) + "px")
.style("top", (d3.event.pageY - 28) + "px");
})
.on("mouseout", function(d) {
div.transition()
.duration(5)
.style("opacity", 0);
});

d3.select("#hand")
.datum(data[newYearsEve])
.on("mousemove",  function(d, i) {
div.transition()
.duration(5)
.style("opacity", 1);
div.html(d["hand"] + " mensen")
.style("left", (d3.event.pageX) + "px")
.style("top", (d3.event.pageY - 28) + "px");
})
.on("mouseout", function(d) {
div.transition()
.duration(5)
.style("opacity", 0);
});

d3.select("#leg")
.datum(data[newYearsEve])
.on("mousemove",  function(d, i) {
div.transition()
.duration(5)
.style("opacity", 1);
div.html(d["leg"] + plural(d["leg"],"persoon"))
.style("left", (d3.event.pageX) + "px")
.style("top", (d3.event.pageY - 28) + "px");
})
.on("mouseout", function(d) {
div.transition()
.duration(5)
.style("opacity", 0);
});
};

  function plural(n, word) {
    /*   Outputs the correct plural of a word matching the number n.
         Args:
           n       A number.
           word    The word 'persoon', 'oog' or 'werd'.
    */
    if (n == 1) {
      if (word == "persoon") {
        return "persoon";
      } else if (word == "oog") {
        return "oog";
      } else if (word == "werd") {
        return "werd";
      }
    } else {
      if (word == "persoon") {
        return "personen";
      } else if (word == "oog") {
        return "ogen";
      } else if (word == "werd") {
        return "werden";
      }
    };
  };

  function makePiecharts(newYearsEve, dataPiecharts, firstTime) {
    /*   Makes the piecharts.
         Args:
           newYearsEve      The chosen new years eve.
           dataPiecharts    The datasets for the piecharts.
           firstTime        Boolean, to indicate if it is the first time this
                            function is called.
    */
    var svgIDs = ["svgPerAge", "svgPerBystander", "svgPerTypeFireworks",
      "svgPerStatusFireworks"];
    var itemName = ["leeftijd", "wie", "type", "status"];

    for (var i = 0; i < svgIDs.length; i++) {
      makePiechart(svgIDs[i], dataPiecharts[i][newYearsEve], itemName[i],
        firstTime);
    };
  };

  function makePiechart(svgID, data, dataItem, firstTime) {
    /*   Makes the piecharts.
         Args:
           svgID      The id of the svg for the piechart
           data
           dataItem
           firstTime
    */
var svg = d3.select("#" + svgID),
width = +svg.attr("width"),
height = +svg.attr("height"),
radius = Math.min(width, height) / 2,
g = svg.append("g").attr("id", "Piechart" + svgID)
.attr("transform",
"translate(" + width / 2 + "," + height / 2 + ")");

var colors = d3.scaleOrdinal(d3.schemeCategory10);

var pie = d3.pie()
.sort(null)
.value(function(d) { return d.number; });

var path = d3.arc().outerRadius(radius).innerRadius(0);

var arc = g.selectAll(".arc")
.data(pie(data))
.enter().append("g")
.attr("class", "arc");

var label =
d3.arc().outerRadius(radius - 40).innerRadius(radius - 40);

arc.append("path")
.attr("d", path)
.attr("fill", function(d) { return colors(d.data[dataItem]); })
.on("mousemove", function(d) {
div.transition()
.duration(1)
.style("opacity", 1);

div.html(d.data.number + " mensen" )
.style("left", (d3.event.pageX) + "px")
.style("top", (d3.event.pageY - 28) + "px");
})
.on("mouseout", function(d) {
div.transition()
.duration(1)
.style("opacity", 0);
});

arc.append("text")
.attr("transform",
function(d) { return "translate(" + label.centroid(d) + ")"; })
.text(function(d) { return d.data[dataItem]; });

// default piechart is invisible
if (firstTime) {
svg.style("opacity", 0);
}

};

function makeBarchart(svgID, data, dataPiecharts,
dataPM10, unit, nameY, colors) {
/*   Creates a barchart for the given data.
Args: An appriopiate data set.
*/



var svg = d3.select("#" + svgID),
margin = {top: 20, right: 100, bottom: 30, left: 60},
width = +svg .attr("width") - margin.left - margin.right,
height = +svg .attr("height") - margin.top - margin.bottom,
g = svg .append("g").attr("id", "BarchartFirstAid")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleBand()
.rangeRound([0, width])
.paddingInner(0.05)
.align(0.1);

var y = d3.scaleLinear().rangeRound([height, 0]);

var z = d3.scaleOrdinal().range(colors);

var keys = data.columns.slice(1);

x.domain(data.map(function(d) { return d.jaarwisseling; }));
y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
z.domain(keys);

g.append("g")
.selectAll("g")
.data(d3.stack().keys(keys)(data))
.enter().append("g")
.attr("fill", function(d) { return z(d.key); })
.selectAll("rect")
.data(function(d) { return d; })
.enter().append("rect")
.attr("class", function(d) { return "newYearsEve" +
d.data.jaarwisseling; })
.attr("x", function(d) { return x(d.data.jaarwisseling); })
.attr("y", function(d) { return y(d[1]); })
.attr("height", function(d) { return y(d[0]) - y(d[1]); })
.attr("width", x.bandwidth())
.attr("opacity", 0.4)
.on("mousemove", function(d) {
div.transition()
.duration(5)
.style("opacity", 1);
div	.html(Math.abs(d[0] - d[1]) + unit )
.style("left", (d3.event.pageX) + "px")
.style("top", (d3.event.pageY - 28) + "px");
//d3.select(this).style("opacity", 1);
})
.on("mouseout", function(d) {
div.transition()
.duration(5)
.style("opacity", 0);
//d3.select(this).style("opacity", 0.5);
})

.on("click", function(d) {

// set all rectangles semi-transparant
d3.selectAll("rect").attr("opacity", 0.4);

// except the rectangles in the legends
d3.selectAll(".rectLegend").attr("opacity", 1);

// obtain x and y position
var xPosition = d.data.jaarwisseling;
var yPosition = d3.select(this.parentNode).attr("fill");

d3.selectAll(".newYearsEve" + xPosition).attr("opacity", 1);

makeTitels(xPosition);

// remake piecharts
makePiecharts(xPosition, dataPiecharts, false);

updateLinechart(dataPM10[xPosition]);

// attemt to keep choice in dropdown up-to-date
d3.select("#y2014-2015").attr("selected", "selected");
return
});

// default selected bar
d3.selectAll(".newYearsEve" + defaultNewYearsEve).attr("opacity", 1);

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

// add legend to the barchart
var legend = g.append("g")
.attr("font-family", "sans-serif")
.attr("font-size", 10)
.attr("text-anchor", "end")
.selectAll("g")
.data(keys.slice().reverse())
.enter().append("g")
.attr("transform",
function(d, i) { return "translate(0," + i * 20 + ")"; });

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
};


function updateLinechart(data) {

// Scale the range of the data again
x.domain(d3.extent(data, function(d) { return d.tijdstip; }));
y.domain([0, d3.max(data, function(d) { return d.waarde; })]);

// Select the section we want to apply our changes to
var gLinechart = d3.select("#svgLinechart").transition();

// Make the changes
gLinechart.select(".line")   // change the line
.duration(750)
.attr("d", valueline(data));
gLinechart.select(".x.axis") // change the x axis
.duration(1)
.call(xAxis);
gLinechart.select(".y.axis") // change the y axis
.duration(750)
.call(yAxis);

var focus = d3.select(".focus");

svgLinechart.append("rect")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
.attr("class", "overlay")
.attr("width", widthLinechart)
.attr("height", heightLinechart)
//.style("opacity", 0)
.on("mouseover", function() { focus.style("display", null); })
.on("mouseout", function() { focus.style("display", "none"); })
.on("mousemove", mousemove);

function mousemove() {


var x0 = x.invert(d3.mouse(this)[0]),
i = bisectDate(data, x0, 1),
d0 = data[i - 1],
d1 = data[i],
d = x0 - d0.tijdstip > d1.tijdstip - x0 ? d1 : d0;
focus.attr("transform", "translate(" + x(d.tijdstip) + "," + y(d.waarde) + ")");
focus.select("text").text(function() { return d.waarde; });
focus.select(".x-hover-line").attr("y2", heightLinechart - y(d.waarde));
focus.select(".y-hover-line").attr("x2", widthLinechart + widthLinechart);
}

};

function makeLinechart(dataPM10) {
//http://bl.ocks.org/d3noob/7030f35b72de721622b8

var newYearsEves = ["2014-2015", "2015-2016", "2016-2017", "2017-2018"];
for (var i = 0; i < newYearsEves.length; i++ ) {
  for (var j = 0; j < dataPM10[newYearsEves[i]].length; j++ ) {
    dataPM10[newYearsEves[i]][j].tijdstip =
      parseTime(dataPM10[newYearsEves[i]][j].tijdstip);
  };
};

data = dataPM10[defaultNewYearsEve];

// Scale the range of the data
x.domain(d3.extent(data, function(d) { return d.tijdstip; }));
y.domain([0, d3.max(data, function(d) { return d.waarde; })]);

// Add the valueline path.
gLinechart.append("path")
.attr("class", "line")
.attr("fill", "none")
.attr("stroke", "blue")
.attr("d", valueline(data));

// Add the X Axis
gLinechart.append("g")
.attr("class", "x axis")
.attr("transform", "translate(0," + heightLinechart + ")")
.call(xAxis);

// Add the Y Axis
gLinechart.append("g")
.attr("class", "y axis")
.call(yAxis);

// text label for the x axis
gLinechart.append("text")
.attr("transform",
"translate(" + widthLinechart + " ," +
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

var focus = gLinechart.append("g")
.attr("class", "focus")
.style("display", "none");

focus.append("line")
.attr("class", "x-hover-line hover-line")
.attr("y1", 0)
.attr("y2", heightLinechart);

focus.append("line")
.attr("class", "y-hover-line hover-line")
.attr("x1", widthLinechart)
.attr("x2", widthLinechart);

focus.append("circle")
.attr("r", 7.5);

focus.append("text")
.attr("x", 15)
.attr("dy", ".31em");

svgLinechart.append("rect")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
.attr("class", "overlay")
.attr("width", widthLinechart)
.attr("height", heightLinechart)
//.style("opacity", 0)
.on("mouseover", function() { focus.style("display", null); })
.on("mouseout", function() { focus.style("display", "none"); })
.on("mousemove", mousemove);

function mousemove() {

var x0 = x.invert(d3.mouse(this)[0]),
i = bisectDate(data, x0, 1),
d0 = data[i - 1],
d1 = data[i],
d = x0 - d0.tijdstip > d1.tijdstip - x0 ? d1 : d0;
focus.attr("transform", "translate(" + x(d.tijdstip) + "," + y(d.waarde) + ")");
focus.select("text").text(function() { return d.waarde; });
focus.select(".x-hover-line").attr("y2", heightLinechart - y(d.waarde));
focus.select(".y-hover-line").attr("x2", widthLinechart + widthLinechart);
}
};

function makeTitels(newYearsEve) {
d3.select("#titlePiechartsSection")
.html("Onderverdeling slachtoffers "+ newYearsEve);

d3.select("#titleInjuriesSection")
.html("Lichamelijk letsel "+ newYearsEve);

d3.select("#titleLinechart")
.html("Fijnstof (PM10) rond de jaarwisseling "+ newYearsEve);

};

function  togglePiechartPerAge() {
if (d3.select("#svgPerAge").style("opacity") == 0) {
d3.select("#svgPerAge").style("opacity", 1);
d3.select("#titlePerAge").html("Per leeftijdsklasse");
} else {
d3.select("#svgPerAge").style("opacity", 0);
d3.select("#titlePerAge").html("");
}
};

function  togglePiechartType() {
if (d3.select("#svgPerTypeFireworks").style("opacity") == 0) {
d3.select("#svgPerTypeFireworks").style("opacity", 1);
d3.select("#titleTypeFireworks").html("Naar soort vuurwerk");
} else {
d3.select("#svgPerTypeFireworks").style("opacity", 0);
d3.select("#titleTypeFireworks").html("");
}
};

function  togglePiechartBystander() {
if (d3.select("#svgPerBystander").style("opacity") == 0) {
d3.select("#svgPerBystander").style("opacity", 1);
d3.select("#titleBystander").html("Zelf afgestoken of omstander");
} else {
d3.select("#svgPerBystander").style("opacity", 0);
d3.select("#titleBystander").html("");
}
};

function  togglePiechartStatus() {
if (d3.select("#svgPerStatusFireworks").style("opacity") == 0) {
d3.select("#svgPerStatusFireworks").style("opacity", 1);
d3.select("#titleStatusFireworks").html("Legaal of illegaal vuurwerk");
} else {
d3.select("#svgPerStatusFireworks").style("opacity", 0);
d3.select("#titleStatusFireworks").html("");
}
};



};
