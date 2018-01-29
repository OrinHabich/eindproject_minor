## Omschrijving

Een website met visualisaties over vuurwerkschade. Deze visualisaties zijn gecentreerd rond drie m's: schade aan mensen, schade aan milieu en materiële schade.  

<img src='https://bettercodehub.com/edge/badge/OrinHabich/project?branch=master'>

## Het technische ontwerp
Er is één html-pagina voor de site. Dit is index.html.
De functionaliteit is verdeeld over meerdere JavaScript files.
Er is een main.js welke wordt uitgevoerd na het laden van de pagina.
Verder zijn er barcharts.js, linechart.js, piecharts.js en helpers.js.

![](docs/imagesProcess/flowFunctions.png)

Op twee manieren kan de data op de webpagina veranderd worden.

De eerste manier is door een staaf in één van de drie staafdiagrammen aan te klikken. Dit zorgt dat de taartdiagrammen en de lijngrafiek worden geupdate naar de jaarwisseling van de aangeklikte staaf. Ook de titels worden aangepast, en de keuze in het dropdown menu.

De tweede manier is doormiddel van het dropdown menu.

Met de checkboxes is aan te geven welke taartdiagrammen zichtbaar moeten zijn.

## Ontwikkeling
Vanaf het begin was duidelijk dat er veel kleine datasets nodig zouden zijn.
Eerst moest worden uitgezocht hoe deze datasets op elkaar aan gingen sluiten, en in hoeverre deze binnen het verhaal gingen passen.
Vooral de data over de afgelopen jaarwisseling compleet krijgen was een google-uitdaging.

Het poppetje leek mij een leuke en originele visualisatie, maar ik had geen idee hoe
zoiets gemaakt kon worden toen ik het bedacht.
Verrassend genoeg bestaan er dus teken-programmaatjes om svg's mee te maken.
Hierin kunnen id's en class names meegegeven worden aan alle componenten van de tekening.
