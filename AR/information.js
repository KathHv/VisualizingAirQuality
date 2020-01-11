var date = "1";

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
  var senseboxPM10;
  var lanuvWeseler;
  var lanuvGeist;
  if(date == 1){
    var bikePM10 = closestPointToCurrentPosition.pm10;
    sensebox1411.forEach(function (e){
      if(closestPointToCurrentPosition.time == parseTimeBike(e.time)){
        senseboxPM10 = e.pm10
      }
    });

    lanuv1411.forEach(function (e){
      if(e.time.getHours() === closestPointToCurrentPosition.time.getHours()) {
        lanuvWeseler = e.pm10_Weseler;
        lanuvGeist = e.pm10_Geist;
      }
    });
  }
  else
  {
    var bikePM10 = closestPointToCurrentPosition.pm10;

    sensebox1912.forEach(function (e){
      if(closestPointToCurrentPosition.time == parseTimeBike(e.time)){
        senseboxPM10 = e.pm10
      }
    });

    lanuv1912.forEach(function (e){
      if(e.time.getHours() === closestPointToCurrentPosition.time.getHours()) {
        lanuvWeseler = e.pm10_Weseler;
        lanuvGeist = e.pm10_Geist;
      }
    });
  }
  console.log("bike: "+bikePM10+"; Sensebox: "+ senseboxPM10 + "; LANUV Geist: "+ lanuvGeist +"; LANUV Weselerstraße: "+ lanuvWeseler);
  var text = "The data of both LANUV stations, the Sensebox and the bike are summarized:<ul>  <li>LANUV station at the Weselerstraße (traffic): "+ lanuvWeseler +"  </li>  <li>LANUV station in the Geistviertel (residential area): "+ lanuvGeist +"  </li>  <li>Sensebox next to the LANUV station in the Geistviertel: "+ senseboxPM10 +"  </li>  <li>closest bike measurements to your current location: "+ bikePM10 +"  </li></ul>";
  var paragraph = document.getElementById("measurementData");
  paragraph.innerText = text;
}

function setDate(){
  date =  document.getElementById("range").value;

  showAndHideInformation();
  loadContent(date);
}
