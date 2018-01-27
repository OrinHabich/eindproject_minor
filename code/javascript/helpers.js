
function checkboxes() {
  /*   Let checkboxes toggle opacity of piecharts.
       Args: none
  */

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
