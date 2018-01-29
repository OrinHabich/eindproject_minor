/*
  main.js
  Minor programmeren; project
  Orin Habich 10689508

  This is the main file for this project. In this file:
  Are all global variabels defined.
  Is an external svg loaded for the figure of the human.
  Is all data loaded.
  Are several function called (which often call other functions).

  The other functionality of the project is in the files:
  barcharts.js
  linechart.js
  piecharts.js
  helpers.js
*/

 window.onload = afterLoad;

 function afterLoad() {
  /*  This executes the whole script,
      but it is called only when the window is loaded.
      Args: none.
  */

  NEWYEARSEVES = ["2014-2015", "2015-2016", "2016-2017", "2017-2018"];
  DEFAULTNEWYEARSEVE = NEWYEARSEVES[NEWYEARSEVES.length - 1];
  TIMEDURATION = 1000;
  TOOLTIP = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltipGeneral")
    .style("opacity", 0);

  // load svg of figure of human
  d3.xml("images/figureHuman.svg").mimeType("image/svg+xml")
    .get(function(error, xml) {
      if (error) throw error;
      document.getElementById("placeForFigureHuman")
        .appendChild(xml.documentElement);
    });

  // load data
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
      perBystander, perTypeFireworks, perStatusFireworks, perInjury, dataPM10,
      mouemove) {
      /*   Creates charts based on the given data.
           Args:
           error        Boolean, true if error, false otherwise.
           all others   Appriopiate datasets.
      */

      if (error) throw error;

      // make the barcharts
      makeBarchart("FirstAid", dataFirstAid, perInjury, perAge, perBystander,
        perTypeFireworks, perStatusFireworks, dataPM10, " mensen", "Aantal",
        colorsFirstAid, true);
      makeBarchart("Complaints", dataComplaints, perInjury, perAge, perBystander,
        perTypeFireworks, perStatusFireworks, dataPM10, " klachten", "Aantal",
        colorsComplaints, true);
      makeBarchart("Damage", dataDamage, perInjury, perAge, perBystander,
        perTypeFireworks, perStatusFireworks, dataPM10, " miljoen euro",
        "Bedrag (in miljoenen euro)", colorsDamage, false);

      // make default pie charts, linechart and titles
      makePiecharts(perAge, perBystander, perTypeFireworks, perStatusFireworks);
      makeLinechart(dataPM10);
      makeTitles(DEFAULTNEWYEARSEVE);

      // add tooltip to the figure of human
      tooltipFigureHuman(perInjury, DEFAULTNEWYEARSEVE);

      // make the dropdown menu (including functionality)
      dropdown(perInjury, perAge, perBystander, perTypeFireworks,
        perStatusFireworks, dataPM10);

      // set default new years eve on dropdown
      d3.selectAll("#y" + DEFAULTNEWYEARSEVE).attr("selected", true);

      // add functionality to checkboxes
      checkboxes();
  }
}
