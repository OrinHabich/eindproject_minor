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

// function checkReady() {
//   /*  This executes the whole script,
//       but it is called only when the window is loaded.
//       Args: none.
//   */
//   var svg = d3.select("#objectFigureHuman");
//   if (svg._groups[0][0] == null) {
//     document.body.append();
//     //console.log(svg._groups[0]);
//     setTimeout("checkReady()", 300);
//   }
//   else {

  d3.xml("images/figureHuman.svg").mimeType("image/svg+xml").get(function(error, xml) {
    if (error) throw error;
    document.getElementById("placeForFigureHuman").appendChild(xml.documentElement);
    //document.body.appendChild(xml.documentElement);
  });

  var defaultNewYearsEve = "2017-2018";
  var timeDuration = 1000;

  var generalTooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltipGeneral")
    .style("opacity", 0);

  //--------COLOR ARRAYS FOR THE BARCHARTS--------------------------------------
  var colorsFirstAid  = ["#A9A9A9", "#BDB76B"];
  var colorsComplaints = ["#B8860B", "#EE82EE", "	#F5DEB3", "#9ACD32",
    "#C0C0C0"];
  var colorsDamage = ["#B8860B", "#EE82EE", "	#F5DEB3", "#9ACD32", "#C0C0C0"];

  //--------VARIABELS FOR THE PIECHARTS-----------------------------------------
  var colorsAge = d3.scaleOrdinal(d3.schemeCategory10);
  var colorsPie2Slices = d3.scaleOrdinal(["#A9A9A9", "#BDB76B"]);

  //--------VARIABELS FOR THE LINECHART-----------------------------------------
  var svgLinechart = d3.select("#svgLinechart"),
    margin = {top: 20, right: 0, bottom: 50, left: 50},
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
    //.defer(d3.json, "data/infographic.json")

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
      // var dataPiecharts = [perAge, perBystander, perTypeFireworks,
      //   perStatusFireworks];

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
      makePiechart("PerAge", perAge, "leeftijd", colorsAge);
      makePiechart("PerBystander", perBystander, "wie", colorsPie2Slices);
      makePiechart("PerTypeFireworks", perTypeFireworks, "type", colorsPie2Slices);
      makePiechart("PerStatusFireworks", perStatusFireworks, "status", colorsPie2Slices);
      makeLinechart(dataPM10);
      makeTitles(defaultNewYearsEve);

      // add tooltip to the figure of human
      tooltipFigureHuman(perInjury, defaultNewYearsEve);

      // make the dropdown menu (including functionality)
      makeDropdown(dataFirstAid, perInjury, perAge, perBystander,
        perTypeFireworks, perStatusFireworks, dataPM10);

      //tooltipInfographic(dataInfographic);

      // let checkboxes toggle opacity of piecharts
      d3.selectAll(".checkbox").on("change", function(d) {
        if (this.value == "Age") {
          var htmlString = "Per leeftijdsklasse";
        } else if (this.value == "TypeFireworks") {
          var htmlString = "Naar soort vuurwerk"
        } else if (this.value == "Bystander") {
          var htmlString = "Zelf afgestoken of omstander"
        } else if (this.value == "StatusFireworks") {
          var htmlString = "Legaal of illegaal vuurwerk"
        }
        if (d3.select("#svgPer" + this.value).style("opacity") == 0) {
          d3.select("#svgPer" + this.value).style("opacity", 1);
          d3.select("#title" + this.value).html(htmlString);
        } else {
          d3.select("#svgPer" + this.value).style("opacity", 0);
          d3.select("#title" + this.value).html("");
        }
      });

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
        generalTooltip.style("opacity", 1);
        generalTooltip.html(Math.round((d[1] - d[0]) * 10) / 10 + unit)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
        return;
      })
      .on("mouseout", function(d) { generalTooltip.style("opacity", 0)
        return;
      })
      .on("click", function(d) {

        // set all rectangles semi-transparant except those in the legends
        d3.selectAll("rect").attr("opacity", 0.4);
        d3.selectAll(".rectLegend").attr("opacity", 1);

        // obtain x and y position
        var xPosition = d.data.jaarwisseling;
        var yPosition = d3.select(this.parentNode).attr("fill");

        d3.selectAll(".newYearsEve" + xPosition).attr("opacity", 1);

        // update the piecharts, linechart, titles and tooltip on human figure
        updatePiecharts(perAge, perBystander, perTypeFireworks,
          perStatusFireworks, xPosition);
        updateLinechart(dataPM10[xPosition]);
        makeTitles(xPosition);
        tooltipFigureHuman(perInjury, xPosition);

        // attemt to keep choice in dropdown up-to-date
        d3.select("#y" + xPosition).attr("selected", "selected");

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

  // function makePiecharts(dataPiecharts) {
  //   /*   Makes the piecharts.
  //        Args:
  //          newYearsEve      The chosen new years eve.
  //          dataPiecharts    The datasets for the piecharts.
  //          firstTime        Boolean, to indicate if it is the first time this
  //                           function is called.
  //   */
  //   var svgIDs = ["PerAge", "PerBystander", "PerTypeFireworks",
  //     "PerStatusFireworks"];
  //   var itemNames = ["leeftijd", "wie", "type", "status"];
  //
  //   for (var i = 0; i < svgIDs.length; i++) {
  //
  //   };
  // }

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

  function makeLinechart(dataPM10) {
    /*   Makes a linechart about PM10.
         Based on http://bl.ocks.org/d3noob/7030f35b72de721622b8
         Args:
           dataPM10     An appropriate dataset.
    */

    var newYearsEves = ["2014-2015", "2015-2016", "2016-2017", "2017-2018"];

    // preproces data
    for (var i = 0; i < newYearsEves.length; i++) {
      for (var j = 0; j < dataPM10[newYearsEves[i]].length; j++) {
        dataPM10[newYearsEves[i]][j].tijdstip =
        parseTime(dataPM10[newYearsEves[i]][j].tijdstip);
      }
    }
    data = dataPM10[defaultNewYearsEve];

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
             Args: none, but maybe data
        */

        var x0 = x.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.tijdstip > d1.tijdstip - x0 ? d1 : d0;
          tooltipLinechart.attr("transform", "translate(" + x(d.tijdstip) + ","
            + y(d.waarde) + ")");
          tooltipLinechart.select("text").text(function() { return d.waarde; });
          tooltipLinechart.select(".x-hover-line")
            .attr("y2", heightLinechart - y(d.waarde));
          tooltipLinechart.select(".y-hover-line")
            .attr("x2", widthLinechart + widthLinechart);
      }
  }

  function makeTitles(newYearsEve) {
    /*   Makes correct titles on the webpage.
         Args:
           newYearsEve    The chosen new years eve.
    */

    d3.select("#titlePiechartsSection")
      .html("Onderverdeling slachtoffers "+ newYearsEve);

    d3.select("#titleInjuriesSection")
      .html("Lichamelijk letsel "+ newYearsEve);

    d3.select("#titleLinechart")
      .html("Fijnstof (PM10) rond de jaarwisseling "+ newYearsEve);
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
        generalTooltip.style("opacity", 1);
        generalTooltip.html(makeHTMLstring(d, this.parentNode.id))
          .style("left", (d3.event.pageX + 40) + "px")
          .style("top", (d3.event.pageY - 25) + "px");
      })
      .on("mouseout", function(d) {
        generalTooltip.style("opacity", 0);
      });

  }

  function makeHTMLstring(d, bodypart) {
    /*  Makes a HTML string for in the tooltip on the human figure.
         Args:
           d            Dataset of injuries.
           bodypart     Chosen bodypart.
    */
    if (bodypart == "eye"){
      return "Letsel aan ogen bij " + d.eye + " " +
        plural(d.eye, "persoon") + ".<br>Hierbij waren<br>" +
        d.zichtsverlies + " " + plural(d.zichtsverlies, "oog")  +
        " met zichtsverlies,<br>" + d.blind + " " + plural(d.blind, "oog")  +
        " werden blind en<br>" + d.verwijderd + " " +
        plural(d.verwijderd, "oog") + " " + plural(d.verwijderd, "werd")  +
        " verwijderd.";
    } else if (bodypart == "heart") {
      return d.heart + " " + plural(d.heart,"persoon") +
        " overleden<br>" + d.whatHappened;
    } else {
      return d[bodypart] + " " + plural(d[bodypart],"persoon");
    }
  }

  function plural(n, word) {
    /*  Outputs the correct plural of a word matching the number n.
        This ensures correct grammar on the tooltip over the human figure.
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
  }

  function makeDropdown(dataFirstAid, perInjury, perAge, perBystander,
    perTypeFireworks, perStatusFireworks, dataPM10) {
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
      //.attr("selected", "selected")
      .text(function (d) { return d.jaarwisseling; });

    // attempt to have most recent shown by default
    console.log(d3.select(".select").select("#y" + defaultNewYearsEve));
    d3.select("#y" + defaultNewYearsEve).attr("selected", "selected");

    function onchange() {
      /*   Updates site after selection in dropdown menu changes.
           This function is defined and called from onchangeDropdown().
           This function makes the actual changes.
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
      d3.selectAll("rect").attr("opacity", 0.4);
      d3.selectAll(".newYearsEve" + selectValue).attr("opacity", 1);
    };
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
      radius = Math.min(width, height) / 2,
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

    var label = d3.arc().outerRadius(radius - 40).innerRadius(radius - 40);

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
        }
        tooltip.html(d.data.number + " mensen" )
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        tooltip.style("opacity", 0);
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
      radius = Math.min(width, height) / 2,
      g = d3.select("#Piechart" + svgID);

    var pie = d3.pie()
      .sort(null)
      .value(function(d) { return d.number; });

    var path = d3.arc().outerRadius(radius).innerRadius(0);

    var arc = g.selectAll(".arc")
      .data(pie(data[newYearsEve]));
      var label = d3.arc().outerRadius(radius - 40).innerRadius(radius - 40);

      arc.select("path").transition()
        .attr("d", path)
        .attr("fill", function(d) { return colors(d.data[itemName]); })
        .duration(timeDuration)
        .attrTween("d", arcTween);

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
           Args: none, but maybe data
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



  //}
}
