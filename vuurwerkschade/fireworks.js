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
    */

//     d3.xml("images/poppetje.svg").mimeType("image/svg+xml").get(function(error, xml) {
//   if (error) throw error;
//   d3.select("#poppetje").appendChild(xml.documentElement);
// });

    //--------GENERAL VARIABELS-------------------------------------------------
    var defaultNewYearsEve = "2017-2018"

    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var colorsFirstAid  = ["#A9A9A9", "#BDB76B"];
    var colorsComplaints =
      ["#B8860B", "#EE82EE", "	#F5DEB3", "#9ACD32", "#C0C0C0"];
    var colorsDamage = ["#B8860B", "#EE82EE", "	#F5DEB3", "#9ACD32", "#C0C0C0"];

    //-------VARIABELS FOR THE LINECHART----------------------------------------
    var svgLinechart = d3.select("#svgLinechart"),
        margin = {top: 20, right: 100, bottom: 50, left: 50},
        widthLinechart =
        +svgLinechart .attr("width") - margin.left - margin.right,
        heightLinechart =
        +svgLinechart .attr("height") - margin.top - margin.bottom,
        gLinechart = svgLinechart .append("g").attr("id", "linechart")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // parse the time
      var parseTime = d3.timeParse("%Y-%m-%d %H:%M")
          bisectDate = d3.bisector(function(d) { return d.tijdstip; }).left;;

      // set the ranges
      var x = d3.scaleTime().range([0, widthLinechart]);
      var y = d3.scaleLinear().range([heightLinechart, 0]);

      // Define the axes
      var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%H:%M"));
      var yAxis = d3.axisLeft(y);

      // define the line
      var valueline = d3.line()
          .x(function(d) { return x(d.tijdstip); })
          .y(function(d) { return y(d.waarde); });

    //--------LOAD DATA---------------------------------------------------------

    queue()
        .defer(d3.csv, "data/FirstAid.csv", function(d, i, columns) {
            for (i = 1, t = 0; i < columns.length; ++i)
            t += d[columns[i]] = +d[columns[i]];
            d.total = t;
            return d;
        })
        .defer(d3.csv, "data/complaints.csv", function(d, i, columns) {
            for (i = 1, t = 0; i < columns.length; ++i)
            t += d[columns[i]] = +d[columns[i]];
            d.total = t;
            return d;
        })
        .defer(d3.csv, "data/damage.csv", function(d, i, columns) {
            for (i = 1, t = 0; i < columns.length; ++i)
            t += d[columns[i]] = +d[columns[i]];
            d.total = t;
            return d;
        })
      	.defer(d3.json, "data/FirstAidperAge.json")
        .defer(d3.json, "data/FirstAidBystander.json")
        .defer(d3.json, "data/FirstAidperTypeFireworks.json")
        .defer(d3.json, "data/FirstAidperStatusFireworks.json")
        .defer(d3.json, "data/FirstAidperInjury.json")
        .defer(d3.csv, "data/fijnstof14-15.csv")
        .defer(d3.csv, "data/fijnstof15-16.csv")
        .defer(d3.csv, "data/fijnstof16-17.csv")
        .defer(d3.csv, "data/fijnstof17-18.csv")
      	.await(main);

    function main(error, dataFirstAid, dataComplaints, dataDamage,
       perAge, perBystander, perTypeFireworks, perStatusFireworks, perInjury,
       smog14, smog15, smog16, smog17 ) {
        /*   Creates charts based on the given data.
             Args: Appriopiate datasets.
        */
        if (error) throw error;

        var dataLinechart = [smog14, smog15, smog16, smog17];

        var dataFirstAidSection = [perAge, perBystander, perTypeFireworks,
          perStatusFireworks, perInjury];

        makeBarchart("svgFirstAid", dataFirstAid, dataFirstAidSection,
        dataLinechart, " mensen", "Aantal", colorsFirstAid);

        makeBarchart("svgComplaints", dataComplaints, dataFirstAidSection,
        dataLinechart, " klachten", "Aantal", colorsComplaints);

        makeBarchart("svgDamage", dataDamage, dataFirstAidSection,
        dataLinechart, " miljoen euro", "Euro (in miljoenen)", colorsDamage);

        // make default charts and titles
        makeFirstAidSection(defaultNewYearsEve, dataFirstAidSection, true);
        makeLinechart(dataLinechart);
        makeTitels(defaultNewYearsEve);
        onchangeDropdown(dataFirstAid, dataFirstAidSection, dataLinechart);

        //d3.selectAll(".checkbox").property('checked', true);
        d3.select("#checkbox1").on("change", togglePiechartPerAge);
        d3.select("#checkbox2").on("change", togglePiechartType);
        d3.select("#checkbox3").on("change", togglePiechartBystander);
        d3.select("#checkbox4").on("change", togglePiechartStatus);

    };
    //--------FUNCTIONS--------------------------------------------------------

    function onchangeDropdown(dataFirstAid, dataFirstAidSection, dataLinechart) {

      var select = d3.select("#chooseYear")
        .append('select')
        .attr('class','select')
        .on('change', onchange);

      var options = select
        .selectAll('option')
        .data(dataFirstAid).enter()
        .append('option')
        .attr("id", function(d){return "#j" + d.jaarwisseling;})
        .text(function (d) { return d.jaarwisseling; });

        // attempt to have most recent shown by default
        d3.select("#j" + defaultNewYearsEve).property("selected", true);

        function onchange() {
          // results of selecting with dropdown menu
          selectValue = d3.select('select').property('value');
          makeFirstAidSection(selectValue, dataFirstAidSection);
         updateLinechart(selectValue, dataLinechart);

          // highlight in all bargraphs the bar corresponding to selection
          d3.selectAll("rect").attr('opacity', 0.4);
          d3.selectAll(".jaarwisseling" + selectValue).attr('opacity', 1);

          makeTitels(selectValue);
        };
    };


    function addTooltip(data, newYearsEve) {
      // tooltip on eyes of
      d3.select("#eye")
         .datum(data[newYearsEve])
         .on("mousemove",  function(d) {
        div.transition()
            .duration(5)
            .style("opacity", 1);
        div.html("Letsel aan ogen bij " + d.eye + " " +
         plural(d["eye"], "persoon") + ".<br>Hierbij waren<br>" +
          d.zichtsverlies + " " + plural(d.zichtsverlies, "oog")  +
           " met zichtsverlies,<br>" +
          d.blind + " " + plural(d.blind, "oog")  +
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

       d3.select("#heart")
            .datum(data[newYearsEve])
            .on("mousemove",  function(d, i) {
           div.transition()
               .duration(5)
               .style("opacity", 1);
           div.html(d["heart"] + " " + plural(d["heart"],"persoon") + " overleden<br>"
            + d["what happened"])
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY - 28) + "px");
          })
          .on("mouseout", function(d) {
              div.transition()
                  .duration(5)
                  .style("opacity", 0);
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
    }

    function plural(n, word) {
      if (n == 1) {
        if (word == "persoon") {
          return "persoon"
        } else if (word == "oog") {
          return "oog"
        } else if (word == "werd") {
          return "werd"
        }

      } else {
        if (word == "persoon") {
          return "personen"
        } else if (word == "oog") {
          return "ogen"
        } else if (word == "werd") {
          return "werden"
        }
      }
    }

    function makeFirstAidSection(newYearsEve, dataFirstAidSection, firstTime) {
      /*   Updates the piecharts.
           Args: The year and the age group.
      */

      makePiechart("svgPerAge", dataFirstAidSection[0][newYearsEve],
        "leeftijd", firstTime, 10, 60);
      makePiechart("svgPerBystander", dataFirstAidSection[1][newYearsEve],
        "wie", firstTime, -60, 140);
      makePiechart("svgPerTypeFireworks", dataFirstAidSection[2][newYearsEve],
       "type", firstTime, 40, 40);
      makePiechart("svgPerStatusFireworks", dataFirstAidSection[3][newYearsEve],
       "status", firstTime, 40, 40);

      addTooltip(dataFirstAidSection[4], newYearsEve)
    };

    function makePiechart(svgID, data, dataItem, firstTime, labelPos1, labelPos2) {
       /*   Creates a piechart for the given data.
            Args: An appriopiate data set.
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
      d3.arc().outerRadius(radius - labelPos1).innerRadius(radius - labelPos2);

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

    function makeBarchart(svgID, data, dataFirstAidSection,
       dataLinechart, unit, nameY, colors) {
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
           .attr("class", function(d) { return "jaarwisseling" +
            d.data.jaarwisseling; })
           .attr("x", function(d) { return x(d.data.jaarwisseling); })
           .attr("y", function(d) { return y(d[1]); })
           .attr("height", function(d) { return y(d[0]) - y(d[1]); })
           .attr("width", x.bandwidth())
           .attr('opacity', 0.4)
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
               d3.selectAll("rect").attr('opacity', 0.4);

               // except the rectangles in the legends
               d3.selectAll(".rectLegend").attr('opacity', 1);

              // obtain x and y position
               var xPosition = d.data.jaarwisseling;
               var yPosition = d3.select(this.parentNode).attr("fill");

               d3.selectAll(".jaarwisseling" + xPosition).attr('opacity', 1);

               makeTitels(xPosition);

               // remake piecharts
               makeFirstAidSection(xPosition, dataFirstAidSection, false);

              updateLinechart(xPosition, dataLinechart);

              // attemt to keep choice in dropdown up-to-date
              d3.select("#j2014-2015").attr('selected', "selected");
              return
           });

      // default selected bar
      d3.selectAll(".jaarwisseling" + defaultNewYearsEve).attr('opacity', 1);

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


function updateLinechart(newYearsEve, dataLinechart) {

    if (newYearsEve == "2014-2015")
    { dataChosen = dataLinechart[0]}
    else if (newYearsEve == "2015-2016")
    { dataChosen = dataLinechart[1]}
    else if (newYearsEve == "2016-2017")
    { dataChosen = dataLinechart[2]}
    else if (newYearsEve == "2017-2018")
    { dataChosen = dataLinechart[3]}



    	// Scale the range of the data again
    	x.domain(d3.extent(dataChosen, function(d) { return d.tijdstip; }));
	    y.domain([0, d3.max(dataChosen, function(d) { return d.waarde; })]);

    // Select the section we want to apply our changes to
    var gLinechart = d3.select("#svgLinechart").transition();

    // Make the changes
        gLinechart.select(".line")   // change the line
            .duration(750)
            .attr("d", valueline(dataChosen));
        gLinechart.select(".x.axis") // change the x axis
            .duration(1)
            .call(xAxis);
        gLinechart.select(".y.axis") // change the y axis
            .duration(750)
            .call(yAxis);

            var focus = d3.select(".focus");
            // var focus = gLinechart.append("g")
            //     .attr("class", "focus")
            //     .style("display", "none");
            //
            //     focus.append("line")
            //     .attr("class", "x-hover-line hover-line")
            //     .attr("y1", 0)
            //     .attr("y2", heightLinechart);
            //
            //     focus.append("line")
            //     .attr("class", "y-hover-line hover-line")
            //     .attr("x1", widthLinechart)
            //     .attr("x2", widthLinechart);
            //
            //     focus.append("circle")
            //     .attr("r", 7.5);
            //
            //     focus.append("text")
            //     .attr("x", 15)
            //     .attr("dy", ".31em");


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
              i = bisectDate(dataChosen, x0, 1),
              d0 = dataChosen[i - 1],
              d1 = dataChosen[i],
              d = x0 - d0.tijdstip > d1.tijdstip - x0 ? d1 : d0;
              focus.attr("transform", "translate(" + x(d.tijdstip) + "," + y(d.waarde) + ")");
              focus.select("text").text(function() { return d.waarde; });
              focus.select(".x-hover-line").attr("y2", heightLinechart - y(d.waarde));
              focus.select(".y-hover-line").attr("x2", widthLinechart + widthLinechart);
            }

    };

    function makeLinechart(dataLinechart) {
    //http://bl.ocks.org/d3noob/7030f35b72de721622b8

    for (var i = 0; i < dataLinechart.length; i++ )
    {
      dataLinechart[i].forEach(function(d) {
        d.tijdstip = parseTime(d.tijdstip);
        d.waarde = +d.waarde;
      });
    };

    // Scale the range of the data
       x.domain(d3.extent(dataLinechart[3], function(d) { return d.tijdstip; }));
       y.domain([0, d3.max(dataLinechart[3], function(d) { return d.waarde; })]);

       // Add the valueline path.
       gLinechart.append("path")
           .attr("class", "line")
           .attr("fill", "none")
           .attr("stroke", "blue")
           .attr("d", valueline(dataLinechart[3]));

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
              i = bisectDate(dataLinechart[3], x0, 1),
              d0 = dataLinechart[3][i - 1],
              d1 = dataLinechart[3][i],
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

        // d3.select("#titlePerAge").html("Per leeftijdsklasse");
        // d3.select("#titleTypeFireworks").html("Naar soort vuurwerk");
        // d3.select("#titleBystander").html("Zelf afgestoken of omstander");
        // d3.select("#titleStatusFireworks").html("Legaal of illegaal vuurwerk");
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
