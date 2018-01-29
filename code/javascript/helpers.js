/*
  helpers.js
  Minor programmeren; project
  Orin Habich 10689508

  Contains the following functions for the project:
  checkboxes()
  makeHTMLstring()
  plural()
  makeTitles()
  tooltipFigureHuman()
  dropdown()
*/

function checkboxes() {
  /*   Let checkboxes toggle opacity of piecharts.
       Args: none
  */

  // listen for changes on the checkboxes
  d3.selectAll(".checkbox").on("change", function(d) {

    // determine which checkbox is changed
    if (this.value == "Age") {
      var htmlString = "Per leeftijdsklasse";
    } else if (this.value == "TypeFireworks") {
      var htmlString = "Naar soort vuurwerk"
    } else if (this.value == "Bystander") {
      var htmlString = "Zelf afgestoken of omstander"
    } else if (this.value == "StatusFireworks") {
      var htmlString = "Legaal of illegaal vuurwerk"
    }

    // toggle the opacity of the appropriate piechart
    if (d3.select("#svgPer" + this.value).style("opacity") == 0) {
      d3.select("#svgPer" + this.value).style("opacity", 1);
      d3.select("#title" + this.value).html(htmlString);
    } else {
      d3.select("#svgPer" + this.value).style("opacity", 0);
      d3.select("#title" + this.value).html("");
    }
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
    return "Letsel aan dit lichaamsdeel bij " + d[bodypart] + " " +
      plural(d[bodypart],"persoon");
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

function makeTitles(newYearsEve) {
  /*   Makes correct titles on the webpage.
       Args:
         newYearsEve    The chosen new years eve.
  */

  d3.select("#titlePiechartsSection")
    .html("Onderverdeling slachtoffers " + newYearsEve);

  d3.select("#titleInjuriesSection")
    .html("Lichamelijk letsel " + newYearsEve);

  d3.select("#titleLinechart")
    .html("Fijnstof (PM10) rond de jaarwisseling " + newYearsEve);
}

function tooltipFigureHuman(data, newYearsEve) {
  /*   Makes a tooltip on a specific bodypart of the human figure.
       Args:
         data         Dataset of injuries.
         newYearsEve  Chosen new years eve.
  */

  d3.selectAll(".figureHuman")
    .datum(data[newYearsEve])
    .on("mousemove",  function(d) {

      // change color
      d3.select(this.parentNode).style("fill", "#d73027");

      // show tooltip
      TOOLTIP.style("opacity", 1);
      TOOLTIP.html(makeHTMLstring(d, this.parentNode.id))
        .style("left", (d3.event.pageX + 40) + "px")
        .style("top", (d3.event.pageY - 25) + "px");
    })
    .on("mouseout", function(d) {

      // change color back
      if (this.parentNode.id == "eye" || this.parentNode.id == "heart") {
        d3.select(this.parentNode).style("fill", "white");
      } else {
        d3.select(this.parentNode).style("fill", "black");
      }

      // hide tooltip
      TOOLTIP.style("opacity", 0);
    });

}

function dropdown(perInjury, dataPie1, dataPie2, dataPie3, dataPie4, dataPM10) {
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
  for (var i = 0; i < NEWYEARSEVES.length; i++){
    d3.select(".select")
      .append("option")
      .attr("id", "y" + NEWYEARSEVES[i])
      .attr("class", "option")
      .attr("value", NEWYEARSEVES[i])
      .text(NEWYEARSEVES[i]);
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
    updatePiecharts(dataPie1, dataPie2, dataPie3, dataPie4, selectValue);
    updateLinechart(dataPM10[selectValue]);
    makeTitles(selectValue);
    tooltipFigureHuman(perInjury, selectValue);

    // highlight in all bargraphs the bar corresponding to the selection
    d3.selectAll("rect").style("opacity", 0.4);
    d3.selectAll(".newYearsEve" + selectValue).style("opacity", 1);
  };
}
