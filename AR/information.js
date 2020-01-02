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
  var lanuvWeseler = 5.4;
  var lanuvGeist = 4.8;
  var sensebox =3.2;
  var bike = 2.9;
  var text = "The data of both LANUV stations, the Sensebox and the bike are summarized:<ul>  <li>LANUV station at the Weselerstraße (traffic): "+ lanuvWeseler +"  </li>  <li>LANUV station in the Geistviertel (residential area): "+ lanuvGeist +"  </li>  <li>Sensebox next to the LANUV station in the Geistviertel: "+ sensebox +"  </li>  <li>closest bike measurements to your current location: "+ bike +"  </li></ul>";
  var paragraph = document.getElementById("measurementData");
  paragraph.innerText = text;
}
