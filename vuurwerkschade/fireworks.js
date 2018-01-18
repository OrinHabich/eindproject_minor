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

    //--------GENERAL VARIABELS-------------------------------------------------
    var defaultNewYearsEve = "2017-2018"

    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    //--------VARIABLES FOR THE BARCHART ABOUT FIRST AID------------------------
    var svgFirstAid = d3.select("#svgFirstAid"),
        margin = {top: 20, right: 100, bottom: 30, left: 60},
        widthFirstAid =
        +svgFirstAid .attr("width") - margin.left - margin.right,
        heightFirstAid =
        +svgFirstAid .attr("height") - margin.top - margin.bottom,
        gFirstAid = svgFirstAid .append("g").attr("id", "BarchartFirstAid")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xFirstAid = d3.scaleBand()
        .rangeRound([0, widthFirstAid])
        .paddingInner(0.05)
        .align(0.1);

    var yFirstAid = d3.scaleLinear().rangeRound([heightFirstAid, 0]);

    var colorsFirstAid  = ["#A9A9A9", "#BDB76B"];

    var zFirstAid = d3.scaleOrdinal().range(colorsFirstAid );

    //--------VARIABLES FOR THE BARCHART ABOUT COMPLAINTS-----------------------
    var svgComplaints = d3.select("#svgComplaints"),
        margin = {top: 20, right: 100, bottom: 30, left: 60},
        widthComplaints = +svgComplaints .attr("width") - margin.left - margin.right,
        heightComplaints =
        +svgComplaints .attr("height") - margin.top - margin.bottom,
        gComplaints =
        svgComplaints.append("g").attr("id", "BarchartComplaints")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xComplaints = d3.scaleBand()
        .rangeRound([0, widthComplaints])
        .paddingInner(0.05)
        .align(0.1);

    var yComplaints = d3.scaleLinear().rangeRound([heightComplaints, 0]);

    var colorsComplaints =
    ["#B8860B", "#EE82EE", "	#F5DEB3", "#9ACD32", "#C0C0C0"];

    var zComplaints = d3.scaleOrdinal().range(colorsComplaints);

    //--------VARIABLES FOR THE BARCHART ABOUT DAMAGE---------------------------
    var svgDamage = d3.select("#svgDamage"),
        margin = {top: 20, right: 100, bottom: 30, left: 60},
        widthDamage = +svgDamage .attr("width") - margin.left - margin.right,
        heightDamage = +svgDamage .attr("height") - margin.top - margin.bottom,
        gDamage =
        svgDamage.append("g").attr("id", "BarchartDamage")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xDamage = d3.scaleBand()
        .rangeRound([0, widthDamage])
        .paddingInner(0.05)
        .align(0.1);

    var yDamage = d3.scaleLinear().rangeRound([heightDamage, 0]);

    var colorsDamage =
    ["#B8860B", "#EE82EE", "	#F5DEB3", "#9ACD32", "#C0C0C0"];

    var zDamage = d3.scaleOrdinal().range(colorsDamage);

    //--------VARIABLES FOR THE PIECHART FIRST AID PER AGE----------------------
    var svgPerAge = d3.select("#svgPerAge"),
        widthPerAge = +svgPerAge.attr("width"),
        heightPerAge = +svgPerAge.attr("height"),
        radius = Math.min(widthPerAge, heightPerAge) / 2,
        gPerAge =
        svgPerAge.append("g").attr("id", "PiechartFirstAidperAge")
            .attr("transform",
             "translate(" + widthPerAge / 2 + "," + heightPerAge / 2 + ")");

    var colorsPerAge = d3.scaleOrdinal(d3.schemeCategory10);

    var piePerAge = d3.pie()
        .sort(null)
        .value(function(d) { return d.number; });

    var pathPerAge = d3.arc().outerRadius(radius).innerRadius(0);

    var labelPerAge =
    d3.arc().outerRadius(radius - 10).innerRadius(radius - 60);

    var firstTimePerAge = true;

    //--------VARIABLES FOR THE PIECHART ABOUT BYSTANDER------------------------
    var svgBystander = d3.select("#svgPerBystander"),
        widthBystander = +svgBystander.attr("width"),
        heightBystander = +svgBystander.attr("height"),
        radius = Math.min(widthBystander, heightBystander) / 2,
        gBystander =
        svgBystander.append("g").attr("id", "PiechartFirstAidperBystander")
            .attr("transform",
             "translate(" + widthBystander / 2 + "," + heightBystander / 2 + ")");

    var colorsBystander = d3.scaleOrdinal(d3.schemeCategory10);

    var pieBystander = d3.pie()
        .sort(null)
        .value(function(d) { return d.number; });

    var pathBystander = d3.arc().outerRadius(radius).innerRadius(0);

    var labelBystander =
    d3.arc().outerRadius(radius + 60).innerRadius(radius - 140);

    var firstTimeBystander = true;

    //--------VARIABLES FOR THE PIECHART ABOUT TYPE FIREWORKS-------------------
    var svgTypeFireworks =
        d3.select("#svgPerTypeFireworks"),
        widthPiechart = +svgTypeFireworks.attr("width"),
        heightPiechart = +svgTypeFireworks.attr("height"),
        radius = Math.min(widthPiechart, heightPiechart) / 2,
        gTypeFireworks = svgTypeFireworks.append("g")
            .attr("id", "PiechartFirstAidperTypeFireworks")
            .attr("transform",
             "translate(" + widthPiechart / 2 + "," + heightPiechart / 2 + ")");

    var colorsTypeFireworks = d3.scaleOrdinal(d3.schemeCategory10);

    var pieTypeFireworks = d3.pie()
        .sort(null)
        .value(function(d) { return d.number; });

    var pathTypeFireworks = d3.arc().outerRadius(radius).innerRadius(0);

    var labelTypeFireworks =
    d3.arc().outerRadius(radius - 40).innerRadius(radius - 40);

    var firstTimeTypeFireworks = true;

    //--------VARIABLES FOR THE PIECHART ABOUT STATUS FIREWORKS-----------------
    var svgStatusFireworks = d3.select("#svgPerStatusFireworks"),
        widthStatusFireworks = +svgStatusFireworks.attr("width"),
        heightStatusFireworks = +svgStatusFireworks.attr("height"),
        radius = Math.min(widthPiechart, heightPiechart) / 2,
        gStatusFireworks = svgStatusFireworks.append("g")
            .attr("id", "PiechartstatusVuurwerk")
            .attr("transform",
             "translate(" + widthStatusFireworks / 2 + "," + heightStatusFireworks / 2 + ")");

    var colorsStatusFireworks = d3.scaleOrdinal(d3.schemeCategory10);

    var pieStatusFireworks = d3.pie()
        .sort(null)
        .value(function(d) { return d.number; });

    var pathStatusFireworks = d3.arc().outerRadius(radius).innerRadius(0);

    var labelStatusFireworks =
    d3.arc().outerRadius(radius - 40).innerRadius(radius - 40);

    var firstTimeStatusFireworks = true;

    //-------VARIABELS FOR THE LINECHART----------------------------------------
    var svgLinechart = d3.select("#svgLinechart"),
        margin = {top: 20, right: 100, bottom: 50, left: 50},
        widthLinechart =
        +svgLinechart .attr("width") - margin.left - margin.right,
        heightLinechart =
        +svgLinechart .attr("height") - margin.top - margin.bottom,
        gLinechart = svgLinechart .append("g").attr("id", "Linechart")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // parse the time
      var parseTime = d3.timeParse("%Y-%m-%d %H:%M");

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

        var dataLinechart =
          [smog14, smog15, smog16, smog17];

        var dataFirstAidSection =
          [perAge, perBystander, perTypeFireworks, perStatusFireworks, perInjury]


        makeBarchart(xFirstAid, yFirstAid, zFirstAid, gFirstAid,
          widthFirstAid, heightFirstAid, dataFirstAid, dataFirstAidSection,
           " mensen", "Aantal", dataLinechart);

       makeBarchart(xComplaints, yComplaints, zComplaints, gComplaints,
         widthComplaints, heightComplaints, dataComplaints, dataFirstAidSection,
          " klachten", "Aantal", dataLinechart);

        makeBarchart(xDamage, yDamage, zDamage, gDamage,
          widthDamage, heightDamage, dataDamage, dataFirstAidSection, " miljoen euro",
             "Euro (in miljoenen)", dataLinechart);

        // Draw default piecharts
        updateFirstAidsection(defaultNewYearsEve, dataFirstAidSection, true);

           makeLinechart(dataLinechart)

        makeTitels(defaultNewYearsEve)

        //------DROPDOWN MENU SECTIE, MOET NAAR LOGISCHERE PLEK NOG ------------
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


          function onchange() {
            // results of selecting with dropdown menu
            selectValue = d3.select('select').property('value');

            updateFirstAidsection(defaultNewYearsEve, dataFirstAidSection, false);
           updateLinechart(selectValue, dataLinechart);

            // highlight in all bargraphs the bar corresponding to selection
            d3.selectAll("rect").attr('opacity', 0.4);
            d3.selectAll(".jaarwisseling" + selectValue).attr('opacity', 1);

            makeTitels(selectValue);
            addTooltip(perInjury, selectValue);
          };

          addTooltip(perInjury, defaultNewYearsEve);

    };
    //--------FUNCTIONS--------------------------------------------------------


    function addTooltip(data, newYearsEve) {

      // tooltip on eyes of
      d3.select("#eye")
         .datum(data[newYearsEve])
         .on("mousemove",  function(d) {
        div.transition()
            .duration(5)
            .style("opacity", 1);
        div.html("Letsel aan ogen: " + d.eye + "<br>Hierbij waren<br>" +
          d.zichtsverlies + " ogen met zichtsverlies,<br>" +
          d.blind + " ogen werden blind en<br>" + d.verwijderd +
           " ogen werden verwijderd.")
          .style("left", (d3.event.pageX + 20) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
       })
       .on("mouseout", function(d) {
           div.transition()
               .duration(5)
               .style("opacity", 0);
       });

       // tooltips for other bodyparts of
       var bodyparts = ["head", "body", "arm", "hand", "leg"];

       for (var i = 0; i < bodyparts.length; i++) {
          d3.select("#" + bodyparts[i])
            .datum(data[newYearsEve])
            .on("mousemove",  function(d, i) {
           div.transition()
               .duration(5)
               .style("opacity", 1);
           div.html(d[bodyparts[i]] + " mensen")
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY - 28) + "px");
          })
          .on("mouseout", function(d) {
              div.transition()
                  .duration(5)
                  .style("opacity", 0);
          });
      }
    }

    function updateFirstAidsection(newYearsEve, dataFirstAidSection, firstTime) {
      /*   Updates the piecharts.
           Args: The year and the age group.
      */

      // var svgIDs =
      // ["svgPerAge", "svgPerTypeFireworks", "svgPerBystander", "svgPerStatusFireworks"];
      //
      // var dataItems = ["leeftijd", "wie", "status", "type"];

      // for (var i = 0; i < dataFirstAidSection.length; i++ ) {
      // makePiechart(dataItems[i], dataFirstAidSection[i], firstTime, svgIDs[i]);
      // }
      makePiechart(gPerAge, piePerAge, pathPerAge, colorsPerAge, labelPerAge,
        "leeftijd", dataFirstAidSection[0][newYearsEve], firstTime);
      makePiechart(gBystander, pieBystander, pathBystander, colorsBystander,
        labelBystander, "wie", dataFirstAidSection[1][newYearsEve], firstTime);
      makePiechart(gTypeFireworks, pieTypeFireworks, pathTypeFireworks,
        colorsTypeFireworks, labelTypeFireworks, "type",
        dataFirstAidSection[2][newYearsEve], firstTime);
      makePiechart(gStatusFireworks, pieStatusFireworks,
         pathStatusFireworks,
        colorsStatusFireworks, labelStatusFireworks, "status",
        dataFirstAidSection[3][newYearsEve], firstTime);


      //addTooltip(dataFirstAidletsel, jaarwisseling)
    };

    function makePiechart(g, pie, path, colors, label, dataItem,
      data, firstTime) {
       /*   Creates a piechart for the given data.
            Args: An appriopiate data set.
       */
       if (!firstTime){
         g.selectAll(".arc").data([]).exit().remove();
       };

       var arc = g.selectAll(".arc")
          .data(pie(data))
          .enter().append("g")
          .attr("class", "arc");

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
    };

    function makeBarchart(x, y, z, g, width, height, data,
       dataFirstAidSection, unit, nameY, dataLinechart) {
       /*   Creates a barchart for the given data.
            Args: An appriopiate data set.
       */
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
               updateFirstAidsection(xPosition, dataFirstAidSection, false);

              updateLinechart(xPosition, dataLinechart);
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


function updateLinechart(gekozenJaarwisseling, dataLinechart) {

    if (gekozenJaarwisseling == "2014-2015")
    { dataChosen = dataLinechart[0]}
    else if (gekozenJaarwisseling == "2015-2016")
    { dataChosen = dataLinechart[1]}
    else if (gekozenJaarwisseling == "2016-2017")
    { dataChosen = dataLinechart[2]}
    else if (gekozenJaarwisseling == "2017-2018")
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


        };

    function makeTitels(gekozenJaarwisseling) {
        d3.select("#titlePiechartsSection")
        .html("Onderverdeling slachtoffers "+ gekozenJaarwisseling);

        d3.select("#titleLinechart")
        .html("Fijnstof (PM10) rond de jaarwisseling "+ gekozenJaarwisseling);
      };





};
