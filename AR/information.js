var date;

/*
* hides or shows the information block on top of the AR
*/
function showAndHideInformation(){

  var information = document.getElementById("information");
  if(information.style.display === "none"){
    information.style.display = "flex";
    showCurrentData();
  }
  else{
    information.style.display = "none";
  }
}

/*
* writes the measurements of the certain location into the information block
*/
function showCurrentData(){
  console.log("showCurrentData");
  if(date == 1){
    var bikePM10 = closestPointToCurrentPosition.air_quality.pm10;
    sensebox1411.foreach(function (e){
      if(closestPointToCurrentPosition.time == parseTimeBike(e.time)){
        var senseboxPM10 = e.pm10
      }
    });

    lanuv1411.foreach(function (e){
      if(formatHour(e.time) == formatHour(closestPointToCurrentPosition.time){
        var lanuvWeseler = e.pm10_Weseler;
        var lanuvGeist = e.pm10_Geist;
      }

  }
  else
  {
    var bikePM10 = closestPointToCurrentPosition.air_quality.pm10;

    sensebox1912.foreach(function (e){
      if(closestPointToCurrentPosition.time == parseTimeBike(e.time)){
        var senseboxPM10 = e.pm10
      }
    });

    lanuv1912.foreach(function (e){
      if(formatHour(closestPointToCurrentPosition.time == formatHour(e.time) ){
        var lanuvWeseler = e.pm10_Weseler;
        var lanuvGeist = e.pm10_Geist;
      }
  }
  console.log("bike: "+bikePM10+"; Sensebox: "+ senseboxPM10 + "; LANUV Geist: "+ lanuvGeist +"; LANUV Weselerstraße: "+ lanuvWeseler);
  var text = "The data of both LANUV stations, the Sensebox and the bike are summarized:<ul>  <li>LANUV station at the Weselerstraße (traffic): "+ lanuvWeseler +"  </li>  <li>LANUV station in the Geistviertel (residential area): "+ lanuvGeist +"  </li>  <li>Sensebox next to the LANUV station in the Geistviertel: "+ sensebox +"  </li>  <li>closest bike measurements to your current location: "+ bike +"  </li></ul>";
  var paragraph = document.getElementById("measurementData");
  paragraph.innerText = text;
}

function setDate(){
date =  document.getElementById("range").value;

showAndHideInformation();
}
