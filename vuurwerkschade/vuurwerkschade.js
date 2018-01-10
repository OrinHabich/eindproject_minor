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
    var svgBarchart = d3.select("#svgBarchartSEH"),
        margin = {top: 20, right: 100, bottom: 30, left: 60},
        widthBarchart = +svgBarchart.attr("width") - margin.left - margin.right,
        heightBarchart = +svgBarchart.attr("height") - margin.top - margin.bottom,
        gBarchart = svgBarchart.append("g").attr("id", "Barchart")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand()
        .rangeRound([0, widthBarchart])
        .paddingInner(0.05)
        .align(0.1);

    var y = d3.scaleLinear().rangeRound([heightBarchart, 0]);

    var colorsBarchart = ["#A9A9A9", "#BDB76B"];

    var z = d3.scaleOrdinal().range(colorsBarchart);

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



    //--------------------------------------------------------------------------
    // load the data and call makeCharts()
    queue()
        .defer(d3.csv, "data/SEH.csv", function(d, i, columns) {
            for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
            d.total = t;
            return d;
        })
      	.defer(d3.json, "data/SEHperLeeftijd.json")
        .defer(d3.json, "data/SEHomstander.json")
        .defer(d3.json, "data/SEHperTypeVuurwerk.json")
        .defer(d3.json, "data/SEHstatusVuurwerk.json")
      	.await(makeCharts);

    function makeCharts(error, dataBarchart, dataPiechartSEHperLeeftijd,
       dataPiechartSEHomstander, dataPiechartSEHperTypeVuurwerk, dataPiechartSEHstatusVuurwerk) {
        /*   Creates charts based on the given data.
             Args: Appriopiate datasets.
        */
        if (error) throw error;

        var keys = dataBarchart.columns.slice(1);

        x.domain(dataBarchart.map(function(d) { return d.jaarwisseling; }));
        y.domain([0, d3.max(dataBarchart, function(d) { return d.total; })]).nice();
        z.domain(keys);

        // make the barchart
        gBarchart.append("g")
            .selectAll("g")
            .data(d3.stack().keys(keys)(dataBarchart))
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

                // remake piechart
                gPiechartSEHperLeeftijd.selectAll(".arc").data([]).exit().remove();
                makePiechart(gPiechartSEHperLeeftijd, pieSEHperLeeftijd, pathSEHperLeeftijd,
                  colorsPiechartSEHperLeeftijd, labelSEHperLeeftijd, "leeftijd",
                  dataPiechartSEHperLeeftijd[xPosition]);

                gPiechartSEHomstander.selectAll(".arc").data([]).exit().remove();
                makePiechart(gPiechartSEHomstander, pieSEHomstander, pathSEHomstander,
                  colorsPiechartSEHomstander, labelSEHomstander, "omstander",
                  dataPiechartSEHomstander["2014/2015"]);

                gPiechartSEHstatusVuurwerk.selectAll(".arc").data([]).exit().remove();
                makePiechart(gPiechartSEHstatusVuurwerk, pieSEHstatusVuurwerk, pathSEHstatusVuurwerk,
                  colorsPiechartSEHstatusVuurwerk, labelSEHstatusVuurwerk, "status",
                  dataPiechartSEHstatusVuurwerk["2014/2015"]);

                gPiechartSEHperTypeVuurwerk.selectAll(".arc").data([]).exit().remove();
                makePiechart(gPiechartSEHperTypeVuurwerk, pieSEHperTypeVuurwerk, pathSEHperTypeVuurwerk,
                  colorsPiechartSEHperTypeVuurwerk, labelSEHperTypeVuurwerk, "type",
                  dataPiechartSEHperTypeVuurwerk["2014/2015"]);

                titlePiechart(xPosition);
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

      // Draw default piecharts
      makePiechart(gPiechartSEHperLeeftijd, pieSEHperLeeftijd, pathSEHperLeeftijd,
        colorsPiechartSEHperLeeftijd, labelSEHperLeeftijd, "leeftijd",
        dataPiechartSEHperLeeftijd["2014/2015"]);
      makePiechart(gPiechartSEHomstander, pieSEHomstander, pathSEHomstander,
        colorsPiechartSEHomstander, labelSEHomstander, "omstander",
        dataPiechartSEHomstander["2014/2015"]);
      makePiechart(gPiechartSEHperTypeVuurwerk, pieSEHperTypeVuurwerk, pathSEHperTypeVuurwerk,
        colorsPiechartSEHperTypeVuurwerk, labelSEHperTypeVuurwerk, "type",
        dataPiechartSEHperTypeVuurwerk["2014/2015"]);
      makePiechart(gPiechartSEHstatusVuurwerk, pieSEHstatusVuurwerk, pathSEHstatusVuurwerk,
        colorsPiechartSEHstatusVuurwerk, labelSEHstatusVuurwerk, "status",
        dataPiechartSEHstatusVuurwerk["2014/2015"]);
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

    function makePiechart(gPiechart, pie, path, colorsPiechart,
       label, dataItem, dataChosen) {
       /*   Creates a piechart for the given data.
            Args: An appriopiate data set.
       */

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

};
