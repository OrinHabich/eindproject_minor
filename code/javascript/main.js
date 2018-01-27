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

  d3.xml("images/figureHuman.svg").mimeType("image/svg+xml").get(function(error, xml) {
    if (error) throw error;
    document.getElementById("placeForFigureHuman").appendChild(xml.documentElement);
  });

  var newYearsEves = ["2014-2015", "2015-2016", "2016-2017", "2017-2018"];
  var defaultNewYearsEve = newYearsEves[newYearsEves.length - 1];
  var timeDuration = 1000;

  var generalTooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltipGeneral")
    .style("opacity", 0);

  //--------COLOR ARRAYS FOR THE BARCHARTS--------------------------------------
  var colorsFirstAid  = ["#fc8d59", "#d73027"];
  var colorsComplaints = ["#fc8d59", "#4575b4",
    "#91bfdb", "#ffffbf", "#fee090"];
  var colorsDamage = ["#fc8d59"];


  //var colorsAge = d3.scaleOrdinal(d3.schemeCategory10);
  var colorsPie2Slices = d3.scaleOrdinal(["#91bfdb", "#4575b4", "#d73027", "#fc8d59", "#fee090", "#ffffbf"]);

  //--------VARIABELS FOR THE LINECHART-----------------------------------------
  var svgLinechart = d3.select("#svgLinechart"),
    margin = {top: 20, right: 0, bottom: 50, left: 60},
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
    .defer(d3.csv, "data/firstAid.csv", function(d, i, columns) {
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
    .defer(d3.json, "data/firstAidperAge.json")
    .defer(d3.json, "data/firstAidBystander.json")
    .defer(d3.json, "data/firstAidperTypeFireworks.json")
    .defer(d3.json, "data/firstAidperStatusFireworks.json")
    .defer(d3.json, "data/firstAidperInjury.json")
    .defer(d3.json, "data/pm10.json")
    .await(main);

    function main(error, dataFirstAid, dataComplaints, dataDamage, perAge,
      perBystander, perTypeFireworks, perStatusFireworks, perInjury, dataPM10, mouemove) {
      /*   Creates charts based on the given data.
           Args:
           error        Boolean, true if error, false otherwise.
           all others   Appriopiate datasets.
      */

      if (error) throw error;

      // pre-process data linechart
      for (var i = 0; i < newYearsEves.length; i++) {
        for (var j = 0; j < dataPM10[newYearsEves[i]].length; j++) {
          dataPM10[newYearsEves[i]][j].tijdstip =
          parseTime(dataPM10[newYearsEves[i]][j].tijdstip);
        }
      }

      // make the barcharts
      makeBarchart("FirstAid", dataFirstAid, perInjury, perAge, perBystander, perTypeFireworks,
        perStatusFireworks,
        dataPM10, " mensen", "Aantal", colorsFirstAid, true);
      makeBarchart("Complaints", dataComplaints, perInjury, perAge, perBystander, perTypeFireworks,
        perStatusFireworks,
        dataPM10, " klachten", "Aantal", colorsComplaints, true);
      makeBarchart("Damage", dataDamage, perInjury, perAge, perBystander, perTypeFireworks,
        perStatusFireworks, dataPM10,
        " miljoen euro", "Euro (in miljoenen)", colorsDamage, false);

      // make default pie charts, linechart and titles
      makePiecharts(perAge, perBystander, perTypeFireworks, perStatusFireworks);
      makeLinechart(dataPM10[defaultNewYearsEve]);
      makeTitles(defaultNewYearsEve);

      // add tooltip to the figure of human
      tooltipFigureHuman(perInjury, defaultNewYearsEve);

      // make the dropdown menu (including functionality)
      dropdown(perInjury, perAge, perBystander, perTypeFireworks,
        perStatusFireworks, dataPM10);

      // set default new years eve on dropdown
      d3.selectAll("#y" + defaultNewYearsEve).attr("selected", true);

      // add functionality to checkboxes
      checkboxes();


  }

  //--------FUNCTIONS-----------------------------------------------------------


  function makeBarchart(svgID, data, perInjury, perAge, perBystander,
    perTypeFireworks, perStatusFireworks, dataPM10, unit, nameY, colors, legend) {
    /*   Makes a stacked barchart.
         Args:
           svgID        The id of the svg for the barchart.
           data         The dataset for the barchart.
           perInjury    Dataset for the figure of human.
           dataPM10     The dataset for the linechart.
           unit         The unit on the y axis.
           nameY        The text for on the label along the y axis.
           colors
           legends      Boolean to indicate if a legend should be added.
    */

    var svg = d3.select("#svg" + svgID),
      margin = {top: 20, right: 100, bottom: 30, left: 60},
      width = +svg .attr("width") - margin.left - margin.right,
      height = +svg .attr("height") - margin.top - margin.bottom,
      g = svg .append("g").attr("id", "barchart" + svgID)
       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand()
      .rangeRound([0, width])
      .paddingInner(0.05)
      .align(0.1);

    var y = d3.scaleLinear().rangeRound([height, 0]);

    var z = d3.scaleOrdinal().range(colors);

    var keys = data.columns.slice(1);

    var selectedNewYearsEve = defaultNewYearsEve;

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
        if (d[1] - d[0] != 0) {
          generalTooltip.style("opacity", 1);
          generalTooltip.html(d[1] - d[0] + unit)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
        };
        d3.select(this).style("stroke-width", 2).style("stroke", "black");
      })
      .on("mouseout", function(d) {
        generalTooltip.style("opacity", 0);
        d3.select(this).style("stroke-width", 0);
      })
      .on("click", function(d) {

        // set all rectangles semi-transparant except those in the legends
        d3.selectAll("rect").style("opacity", 0.4);
        d3.selectAll(".rectLegend").style("opacity", 1);

        // obtain x and y position
        var xPosition = d.data.jaarwisseling;
        var yPosition = d3.select(this.parentNode).attr("fill");

        d3.selectAll(".newYearsEve" + xPosition).style("opacity", 1);

        // update the piecharts, linechart, titles and tooltip on human figure
        updatePiecharts(perAge, perBystander, perTypeFireworks,
          perStatusFireworks, xPosition);
        updateLinechart(dataPM10[xPosition]);
        makeTitles(xPosition);
        tooltipFigureHuman(perInjury, xPosition);

        // attemt to keep choice in dropdown up-to-date
        d3.selectAll(".option").property("selected", false);
        d3.select("#y" + xPosition).property("selected", true);

        return;
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

    if (legend) {
      // make legend
      var legend = g.append("g")
        .attr("font-family", "sans-serif")
        //.attr("font-size", 30)
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

  function makeLinechart(data) {
    /*   Makes a linechart about PM10.
         Based on http://bl.ocks.org/d3noob/7030f35b72de721622b8
         Args:
           dataPM10     An appropriate dataset.
    */

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
      .attr("class", "tooltipLinechart")
      .style("display", "none");

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

      var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.tijdstip > d1.tijdstip - x0 ? d1 : d0;
        tooltipLinechart.attr("transform", "translate(" + x(d.tijdstip) + "," +
          y(d.waarde) + ")");
        tooltipLinechart.select("text").text(function() { return d.waarde; });
        tooltipLinechart.select(".x-hover-line").attr("y2", heightLinechart - y(d.waarde));
        tooltipLinechart.select(".y-hover-line").attr("x2", widthLinechart + widthLinechart);
    }
}

function updateLinechart(data) {
  /*   Updates the linechart.
       Args:
        data    An appropriate dataset.
  */

  // scale domain and range of data
  x.domain(d3.extent(data, function(d) { return d.tijdstip; }));
  y.domain([0, d3.max(data, function(d) { return d.waarde; })]);

  // select the section we want to apply our changes to
  var gLinechart = d3.select("#svgLinechart").transition();

  // change the line
  gLinechart.select(".line")
    .duration(timeDuration)
    .attr("d", valueline(data));

  // change the x axis
  gLinechart.select(".x.axis")
    .duration(0)
    .call(xAxis);

  // change the y axis
  gLinechart.select(".y.axis")
    .duration(timeDuration)
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

    var x0 = x.invert(d3.mouse(this)[0]),
      i = bisectDate(data, x0, 1),
      d0 = data[i - 1],
      d1 = data[i],
      d = x0 - d0.tijdstip > d1.tijdstip - x0 ? d1 : d0;
      tooltipLinechart.attr("transform", "translate(" + x(d.tijdstip) + "," +
        y(d.waarde) + ")");
      tooltipLinechart.select("text").text(function() { return d.waarde; });
      tooltipLinechart.select(".x-hover-line").attr("y2", heightLinechart - y(d.waarde));
      tooltipLinechart.select(".y-hover-line").attr("x2", widthLinechart + widthLinechart);
  }
}

  function tooltipFigureHuman(data, newYearsEve) {
    /*   Makes a tooltip on a specific bodypart of the human figure.
         Args:
           data         Dataset of injuries.
           newYearsEve  Chosen new years eve.
           bodypart     Chosen bodypart.
    */

    d3.selectAll(".figureHuman")
      .datum(data[newYearsEve])
      .on("mousemove",  function(d) {
        d3.select(this.parentNode).style("fill", "#d73027");
        generalTooltip.style("opacity", 1);
        generalTooltip.html(makeHTMLstring(d, this.parentNode.id))
          .style("left", (d3.event.pageX + 40) + "px")
          .style("top", (d3.event.pageY - 25) + "px");
      })
      .on("mouseout", function(d) {
        if (this.parentNode.id == "eye" || this.parentNode.id == "heart") {
          d3.select(this.parentNode).style("fill", "white");
        } else {
          d3.select(this.parentNode).style("fill", "black");
        }
        generalTooltip.style("opacity", 0);
      });

  }

  function dropdown(perInjury, perAge, perBystander,
    perTypeFireworks, perStatusFireworks, dataPM10) {
    /*   Takes care of the dropdown menu. Adds all options and updates the
         site after selection in dropdown menu changes.
         Note: The actual funcionality is in onchange().
         Args:
           firstAid               Dataset to extract options from.
           perInjury              Dataset of the barchart about first aid.
           dataPiechartsAndHuman  Array with datasets for piecharts and
                                  figure of the human.
           dataPM10               Dataset for linechart.
    */

    // make the dropdown menu, e.i. add the options
    for (var i = 0; i < newYearsEves.length; i++){
      d3.select(".select")
        .append("option")
        .attr("id", "y" + newYearsEves[i])
        .attr("class", "option")
        .attr("value", newYearsEves[i])
        .text(newYearsEves[i]);
    }

    // add listener, listen for changes in selection
    d3.select(".select").on("change", onchange);

    function onchange() {
      /*   Updates site after selection in dropdown menu changes.
           Args:  None.
      */

      // results of selecting with dropdown menu
      var selectValue = d3.select("select").property("value");

      // update the piecharts, linechart, titles and tooltip on the human figure
      //makePiecharts(selectValue, dataPiecharts);
      updatePiecharts(perAge, perBystander, perTypeFireworks,
        perStatusFireworks, selectValue);
      updateLinechart(dataPM10[selectValue]);
      makeTitles(selectValue);
      tooltipFigureHuman(perInjury, selectValue);

      // highlight in all bargraphs the bar corresponding to the selection
      d3.selectAll("rect").style("opacity", 0.4);
      d3.selectAll(".newYearsEve" + selectValue).style("opacity", 1);
    };
  }
}
