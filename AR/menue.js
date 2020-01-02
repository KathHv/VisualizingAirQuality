var menueTopic = document.getElementsByClassName("menue-topic");
var menueContent = document.getElementsByClassName("menue-content");

hideMenu();

function hideMenue(){
  var x = document.getElementsByClassName("menue");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
  menueTopic.content = "none";
  menueContent.content = "none";
}

function showIntroduction(){
  var introductionTopic = "Introduction";
  var introductionContent="<div class=\"introductionText\">  <p>        How to use the AR:     <\/p>      <p>        In the upper left corner is a questionmark \"?\". Click on it when you want to gain further information about the AR or if you want to return to this information text.     <\/p>      <p>        There is an associated website where you can get more information about air qualtiy and the way it is measured in the example of Muenster.         The uncertanties between the differentmeasurements in space, time and ways of measurements are analyzed.      <\/p>      <p>        In the application an arrow directing to the next route point is displayed in the middle of the screen.        When you follow it the amount of particles will change.        The start point of the tour is here.(coordinates, adress, google maps link)        <iframe src=\"https:\/\/www.google.com\/maps\/d\/embed?mid=1wKBvzSgLyZSQiVaxqd-n2ABefUzxqcMY\" width=\"640\" height=\"480\"><\/iframe>       Every mircrogramm of PM10 is displayed as 1000 particles on the screen.      <\/p>      <p>        Since we cylced a couple of times, there is a button to switch between the different data of the rides.        More information about when we cycled and which factors influence at which time can be reached here. <\/p>      <p>        Along the cycled route, there are serveral \"guide sign areas\". Those areas are marked with a red circle.        When you enter one, you gain information about the place and why there might be a special situation for air quality measurements.      They are not only placed at striking points but also at averaging places.         Some guide sign areas focus on the varieties of the different rides. <\/p>      <p>        When you want to gain more knowledge about the European standards or normal values in greater cities visit the associated website or the website of the European Union.      <\/p>      "
  ;
}

function showInformation(){
  var infromationTopic = "Information";
  ";}
  var informationContent = "  <div class=\"introductionText\">     <p>       -what did we measure       The AR application displays the air quality around Münster.     <\/p>     <p>       -where did we measure       There were three different measuring types:     <\/p>     <p>       1. LANUV station       This is an official air quality measurement station. The Bundesumweltamt places them at certain points all over Germany.       Münster has two: one at the Weselerstraße and the other in theGeistviertel next to the Ludwig-Erhardt-Berufskolleg.       The Bundesumweltamt provides averaged hourly data. They are rounding to microgramm.       More information about the criteria for placements and the technical properties of the stations can be reached <a href=\"https://www.lanuv.nrw.de/luqs/messorte/steckbrief.php?ort=MSGE\"> here <\/a> for station in Geistviertel and <a href=\"https://www.lanuv.nrw.de/luqs/messorte/steckbrief.php?ort=VMS2\"> here <\/a> for the station at the Weselerstraße.     <\/p>     <p>       2. Sensebox       With very kind support of the Sensebox Lap at the Institute for Geoinformatics at the University of Münster we were able to measure air qualityplaceindepenent.       While going by bike we measured independently next to the LANUV station in the Geistviertel so that we can have a look on changes       in the airquality during the bike ride since there is only one averaged measurement published by LANUV.       For measuring PM10 we used the Sensor.... Since it is an opensource project the box can be bought <a href=\"https:\/\/sensebox.kaufen/product/sensebox-home\"> here <\/a>. The pm10 sensor is available under this <a href=\"https:\/\/sensebox.kaufen/product/feinstaub-sds01w1\"> link <\/a>.     <\/p>     <p>       3. Bike       With support of the Climatology Lab oftheInstitute for Landscape Ecology by Prof. Dr. Otto Klemm at the University of Münster we were able to do two bike rides.       The bike measures environmental data including PM10 data. Therefore, they are using the following sensores:     <\/p>     <p>       - route       We decided for a route around the LANUV station in the Geistviertel to show whether the measurements of the LANUV station is representative or not.       The detailed route can be viewed on this site.       When using theAR the arrow directs along this route.       The starting point of the route is here: coorindates, adress.       <iframe src=\"https:\/\/www.google.com\/maps\/d\/embed?mid=1wKBvzSgLyZSQiVaxqd-n2ABefUzxqcMY\" width=\"640\" height=\"480\"><\/iframe>     <\/p>     <p>       -how did we measure     <\/p>     <p>       - when did we measure       One at the 14th of November 2019, the other on the 19th of December 2019.     <\/p>     <p>       -what are the results       The results of the bike ride are displayed in the AR. There is an information field on the top right corner where the measurements of the LANUV station and the Sensebox can be seen.     <\/p>     <p>       - uncertanties     <\/p>     <p>       -website       For more information and more visual evaluations the associated website provides more detailed information.       Espacially about uncertanties in time, space and technique.     <\/p>   <\/div>";
}

function showSlider(){
var sliderTopic = "Select shown data";
var sliderContent = "
  <div class=\"slidecontainer\">
    <input type=\"range\" min=\"1\" max=\"3\" value=\"2\" class=\"slider\" id=\"myRange\">
  <\/div>
";
}

function showData(){
var dataTopic = "Data in numbers";
var x = 5.10
var dataContent = "your location:<h3> PM10 values in microgramm: <\/h3><p>bike measurement at your position: <\/p><p>LANUV station at Geistviertel(hourly averaged): " + x + "<\/p><p>Sensebox next to LANUV station at Geistviertel: " + x + "<\/p><p>LANUV station at Weserstraße (hourly averaged): " + x + "<\/p>";
}
