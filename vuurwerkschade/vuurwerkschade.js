/*
  vuurwerkschade.js
  Minor programmeren; Project
  Orin Habich 10689508

*/

window.onload = afterLoad;

function afterLoad() {
    /*  This executes the whole script,
        but it is called only when the window is loaded.
    */

    //--------VARIABLES FOR THE BARCHART ABOUT SEH------------------------------
    var svgBarchartSEH = d3.select("#svgBarchartSEH"),
        margin = {top: 20, right: 100, bottom: 30, left: 60},
        widthBarchart = +svgBarchartSEH .attr("width") - margin.left - margin.right,
        heightBarchart = +svgBarchartSEH .attr("height") - margin.top - margin.bottom,
        gBarchartSEH  = svgBarchartSEH .append("g").attr("id", "BarchartSEH ")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xSEH = d3.scaleBand()
        .rangeRound([0, widthBarchart])
        .paddingInner(0.05)
        .align(0.1);

    var ySEH = d3.scaleLinear().rangeRound([heightBarchart, 0]);

    var colorsBarchartSEH  = ["#A9A9A9", "#BDB76B"];

    var zSEH = d3.scaleOrdinal().range(colorsBarchartSEH );

    //--------VARIABLES FOR THE BARCHART ABOUT MELDINGEN VUURWERKOVERLAST------------------------------
    var svgBarchartOverlast = d3.select("#svgBarchartOverlast"),
        margin = {top: 20, right: 100, bottom: 30, left: 60},
        widthBarchart = +svgBarchartOverlast.attr("width") - margin.left - margin.right,
        heightBarchart = +svgBarchartOverlast.attr("height") - margin.top - margin.bottom,
        gBarchartOverlast = svgBarchartOverlast.append("g").attr("id", "BarchartOverlast")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xOverlast = d3.scaleBand()
        .rangeRound([0, widthBarchart])
        .paddingInner(0.05)
        .align(0.1);

    var yOverlast = d3.scaleLinear().rangeRound([heightBarchart, 0]);

    var colorsBarchartOverlast = ["#B8860B", "#EE82EE", "	#F5DEB3", "#9ACD32", "#C0C0C0"];

    var zOverlast = d3.scaleOrdinal().range(colorsBarchartOverlast);

    //--------VARIABLES FOR THE BARCHART ABOUT SCHADE---------------------------
    var svgBarchartSchade = d3.select("#svgBarchartSchade"),
        margin = {top: 20, right: 100, bottom: 30, left: 60},
        widthBarchart = +svgBarchartSchade.attr("width") - margin.left - margin.right,
        heightBarchart = +svgBarchartSchade.attr("height") - margin.top - margin.bottom,
        gBarchartSchade = svgBarchartSchade.append("g").attr("id", "BarchartSchade")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xSchade = d3.scaleBand()
        .rangeRound([0, widthBarchart])
        .paddingInner(0.05)
        .align(0.1);

    var ySchade = d3.scaleLinear().rangeRound([heightBarchart, 0]);

    var colorsBarchartSchade = ["#B8860B", "#EE82EE", "	#F5DEB3", "#9ACD32", "#C0C0C0"];

    var zSchade = d3.scaleOrdinal().range(colorsBarchartSchade);


    //--------VARIABLES FOR THE PIECHART ABOUT 'SEHperLeeftijd'-----------------
    var svgPiechartSEHperLeeftijd = d3.select("#svgPiechartSEHperLeeftijd"),
        widthPiechart = +svgPiechartSEHperLeeftijd.attr("width"),
        heightPiechart = +svgPiechartSEHperLeeftijd.attr("height"),
        radius = Math.min(widthPiechart, heightPiechart) / 2,
        gPiechartSEHperLeeftijd = svgPiechartSEHperLeeftijd.append("g").attr("id", "PiechartLeeftijd")
            .attr("transform",
             "translate(" + widthPiechart / 2 + "," + heightPiechart / 2 + ")");

     var PieTitle = d3.select("#PiechartLeeftijd").append("div")
     .attr("class", "tooltip")
     .style("opacity", 0);

    var colorsPiechartSEHperLeeftijd = d3.scaleOrdinal(d3.schemeCategory10);

    var pieSEHperLeeftijd = d3.pie()
        .sort(null)
        .value(function(d) { return d.number; });

    var pathSEHperLeeftijd = d3.arc().outerRadius(radius).innerRadius(0);

    var labelSEHperLeeftijd = d3.arc().outerRadius(radius + 70).innerRadius(radius - 150);

    var firstTimePiechartSEHperLeeftijd = true;

    //--------VARIABLES FOR THE PIECHART ABOUT OMSTANDER------------------------
    var svgPiechartSEHomstander = d3.select("#svgPiechartSEHomstander"),
        widthPiechart = +svgPiechartSEHomstander.attr("width"),
        heightPiechart = +svgPiechartSEHomstander.attr("height"),
        radius = Math.min(widthPiechart, heightPiechart) / 2,
        gPiechartSEHomstander = svgPiechartSEHomstander.append("g").attr("id", "PiechartOmstander")
            .attr("transform",
             "translate(" + widthPiechart / 2 + "," + heightPiechart / 2 + ")");

     // var PieTitleSEHomstander = d3.select("#PiechartOmstander").append("div")
     // .attr("class", "tooltip")
     // .style("opacity", 0);

    var colorsPiechartSEHomstander = d3.scaleOrdinal(d3.schemeCategory10);

    var pieSEHomstander = d3.pie()
        .sort(null)
        .value(function(d) { return d.number; });

    var pathSEHomstander = d3.arc().outerRadius(radius).innerRadius(0);

    var labelSEHomstander = d3.arc().outerRadius(radius + 70).innerRadius(radius - 100);

    var firstTimePiechartSEHomstander = true;

    //--------VARIABLES FOR THE PIECHART ABOUT TYPE FIREWORKS-------------------
    var svgPiechartSEHperTypeVuurwerk = d3.select("#svgPiechartSEHperTypeVuurwerk"),
        widthPiechart = +svgPiechartSEHperTypeVuurwerk.attr("width"),
        heightPiechart = +svgPiechartSEHperTypeVuurwerk.attr("height"),
        radius = Math.min(widthPiechart, heightPiechart) / 2,
        gPiechartSEHperTypeVuurwerk = svgPiechartSEHperTypeVuurwerk.append("g")
            .attr("id", "PiechartperTypeVuurwerk")
            .attr("transform",
             "translate(" + widthPiechart / 2 + "," + heightPiechart / 2 + ")");

     // var PieTitleSEHperTypeVuurwerk = d3.select("#PiechartperTypeVuurwerk").append("div")
     // .attr("class", "tooltip")
     // .style("opacity", 0);

    var colorsPiechartSEHperTypeVuurwerk = d3.scaleOrdinal(d3.schemeCategory10);

    var pieSEHperTypeVuurwerk = d3.pie()
        .sort(null)
        .value(function(d) { return d.number; });

    var pathSEHperTypeVuurwerk = d3.arc().outerRadius(radius).innerRadius(0);

    var labelSEHperTypeVuurwerk = d3.arc().outerRadius(radius + 70).innerRadius(radius - 100);

    var firstTimePiechartSEHperTypeVuurwerk = true;

    //--------VARIABLES FOR THE PIECHART ABOUT STATUS FIREWORKS-------------------
    var svgPiechartSEHstatusVuurwerk = d3.select("#svgPiechartSEHstatusVuurwerk"),
        widthPiechart = +svgPiechartSEHstatusVuurwerk.attr("width"),
        heightPiechart = +svgPiechartSEHstatusVuurwerk.attr("height"),
        radius = Math.min(widthPiechart, heightPiechart) / 2,
        gPiechartSEHstatusVuurwerk = svgPiechartSEHstatusVuurwerk.append("g")
            .attr("id", "PiechartstatusVuurwerk")
            .attr("transform",
             "translate(" + widthPiechart / 2 + "," + heightPiechart / 2 + ")");

    var colorsPiechartSEHstatusVuurwerk = d3.scaleOrdinal(d3.schemeCategory10);

    var pieSEHstatusVuurwerk = d3.pie()
        .sort(null)
        .value(function(d) { return d.number; });

    var pathSEHstatusVuurwerk = d3.arc().outerRadius(radius).innerRadius(0);

    var labelSEHstatusVuurwerk = d3.arc().outerRadius(radius + 70).innerRadius(radius - 100);

    var firstTimePiechartSEHstatusVuurwerk = true;

    //--------------------------------------------------------------------------
    // load the data and call makeCharts()
    queue()
        .defer(d3.csv, "data/SEH.csv", function(d, i, columns) {
            for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
            d.total = t;
            return d;
        })
        .defer(d3.csv, "data/overlast.csv", function(d, i, columns) {
            for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
            d.total = t;
            return d;
        })
        .defer(d3.csv, "data/schade.csv", function(d, i, columns) {
            for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
            d.total = t;
            return d;
        })
      	.defer(d3.json, "data/SEHperLeeftijd.json")
        .defer(d3.json, "data/SEHomstander.json")
        .defer(d3.json, "data/SEHperTypeVuurwerk.json")
        .defer(d3.json, "data/SEHstatusVuurwerk.json")
      	.await(makeCharts);

    function makeCharts(error, dataBarchartSEH, dataBarchartOverlast, dataBarchartSchade,
       dataPiechartSEHperLeeftijd, dataPiechartSEHomstander,
       dataPiechartSEHperTypeVuurwerk, dataPiechartSEHstatusVuurwerk) {
        /*   Creates charts based on the given data.
             Args: Appriopiate datasets.
        */
        if (error) throw error;

        makeBarchart(xSEH, ySEH, zSEH, gBarchartSEH, dataBarchartSEH, dataPiechartSEHperLeeftijd,
           dataPiechartSEHomstander, dataPiechartSEHperTypeVuurwerk, dataPiechartSEHstatusVuurwerk);

       makeBarchart(xOverlast, yOverlast, zOverlast, gBarchartOverlast, dataBarchartOverlast, dataPiechartSEHperLeeftijd,
          dataPiechartSEHomstander, dataPiechartSEHperTypeVuurwerk, dataPiechartSEHstatusVuurwerk);

        makeBarchart(xSchade, ySchade, zSchade, gBarchartSchade, dataBarchartSchade, dataPiechartSEHperLeeftijd,
           dataPiechartSEHomstander, dataPiechartSEHperTypeVuurwerk, dataPiechartSEHstatusVuurwerk);

        // Draw default piecharts
        updatePiecharts("2014/2015", dataPiechartSEHperLeeftijd,
           dataPiechartSEHomstander, dataPiechartSEHperTypeVuurwerk, dataPiechartSEHstatusVuurwerk, true);
    };

    // This function should update "jaarwisseling" in the title of the website
    function titlePiechart(jaarwisseling) {
      /*   Creates a title for the piechart.
           Args: The year and the age group.
      */
      d3.select(".tooltip").transition().style("opacity", 1);

      d3.select(".tooltip").html("jaarwisseling")
          .style("left", 0)
          .style("top", heightPiechart);
    };

    function updatePiecharts(jaarwisseling, dataPiechartSEHperLeeftijd,
       dataPiechartSEHomstander, dataPiechartSEHperTypeVuurwerk, dataPiechartSEHstatusVuurwerk, firstTime) {
      /*   Updates the piecharts.
           Args: The year and the age group.
      */
      makePiechart(gPiechartSEHperLeeftijd, pieSEHperLeeftijd, pathSEHperLeeftijd,
        colorsPiechartSEHperLeeftijd, labelSEHperLeeftijd, "leeftijd",
        dataPiechartSEHperLeeftijd[jaarwisseling], firstTime);
      makePiechart(gPiechartSEHomstander, pieSEHomstander, pathSEHomstander,
        colorsPiechartSEHomstander, labelSEHomstander, "omstander",
        dataPiechartSEHomstander[jaarwisseling], firstTime);
      makePiechart(gPiechartSEHperTypeVuurwerk, pieSEHperTypeVuurwerk, pathSEHperTypeVuurwerk,
        colorsPiechartSEHperTypeVuurwerk, labelSEHperTypeVuurwerk, "type",
        dataPiechartSEHperTypeVuurwerk[jaarwisseling], firstTime);
      makePiechart(gPiechartSEHstatusVuurwerk, pieSEHstatusVuurwerk, pathSEHstatusVuurwerk,
        colorsPiechartSEHstatusVuurwerk, labelSEHstatusVuurwerk, "status",
        dataPiechartSEHstatusVuurwerk[jaarwisseling], firstTime);
    };

    function makePiechart(gPiechart, pie, path, colorsPiechart,
       label, dataItem, dataChosen, firstTime) {
       /*   Creates a piechart for the given data.
            Args: An appriopiate data set.
       */
       if (!firstTime){
         gPiechart.selectAll(".arc").data([]).exit().remove();
       };

       var arc = gPiechart.selectAll(".arc")
          .data(pie(dataChosen))
          .enter().append("g")
          .attr("class", "arc");

      arc.append("path")
          .attr("d", path)
          .attr("fill", function(d) { return colorsPiechart(d.data[dataItem]); });

      arc.append("text")
          .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
          .text(function(d) { return d.data[dataItem]; });
    };

    function makeBarchart(x, y, z, gBarchart, dataChosen, dataPiechartSEHperLeeftijd,
       dataPiechartSEHomstander, dataPiechartSEHperTypeVuurwerk, dataPiechartSEHstatusVuurwerk) {
       /*   Creates a barchart for the given data.
            Args: An appriopiate data set.
       */
       var keys = dataChosen.columns.slice(1);

       x.domain(dataChosen.map(function(d) { return d.jaarwisseling; }));
       y.domain([0, d3.max(dataChosen, function(d) { return d.total; })]).nice();
       z.domain(keys);

       // make the barchart about SEH
       gBarchart.append("g")
           .selectAll("g")
           .data(d3.stack().keys(keys)(dataChosen))
           .enter().append("g")
           .attr("fill", function(d) { return z(d.key); })
           .selectAll("rect")
           .data(function(d) { return d; })
           .enter().append("rect")
           .attr("x", function(d) { return x(d.data.jaarwisseling); })
           .attr("y", function(d) { return y(d[1]); })
           .attr("height", function(d) { return y(d[0]) - y(d[1]); })
           .attr("width", x.bandwidth())
           .on("click", function(d) {

               // obtain x and y position
               var xPosition = d.data.jaarwisseling;
               var yPosition = d3.select(this.parentNode).attr("fill");

               // remake piecharts
               updatePiecharts(xPosition, dataPiechartSEHperLeeftijd, dataPiechartSEHomstander,
                  dataPiechartSEHperTypeVuurwerk, dataPiechartSEHstatusVuurwerk, false);

               return
           });

       // make x axis
       gBarchart.append("g")
           .attr("class", "axis")
           .attr("transform", "translate(0," + heightBarchart + ")")
           .call(d3.axisBottom(x))
           .append("text")
           .attr("x", widthBarchart + 4)
           .attr("dy", "0.2em")
           .attr("fill", "#000")
           .attr("text-anchor", "start")
           .text("Jaarwisseling");

     // make y axis
     gBarchart.append("g")
           .attr("class", "axis")
           .call(d3.axisLeft(y))
           .append("text")
           .attr("x", 2)
           .attr("y", y(y.ticks().pop()) + 0.5)
           .attr("dy", "0.2em")
           .attr("fill", "#000")
           .attr("text-anchor", "start")
           .text("Aantal");

     // add legend to the barchart
     var legend = gBarchart.append("g")
           .attr("font-family", "sans-serif")
           .attr("font-size", 10)
           .attr("text-anchor", "end")
           .selectAll("g")
           .data(keys.slice().reverse())
           .enter().append("g")
           .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

     legend.append("rect")
           .attr("x", widthBarchart + 60)
           .attr("width", 19)
           .attr("height", 19)
           .attr("fill", z);

     legend.append("text")
           .attr("x", widthBarchart + 50)
           .attr("y", 9.5)
           .attr("dy", "0.32em")
           .text(function(d) { return d; });

    };




};
