/**
 * @author Katharina Hovestadt, Paula Scharf
 */

/**
 * initialzing variables
 *@param currentPosition - current position of the device [lat,lng]
 *@param closestPointToCurrentPosition - point with clostest point on route according to the current position
 *@param visArea - area in document where something can be visualized
 *@param cameraOrientation - orientation of the camera
 *@param direction - direction of the next point on the route
 *@param date - number of the bike trip (either "1" for 14th of november or "2" for 11th of december)
 *@param arrowOrigin
 *@param arrowDestination
 *@param x - stores the current position of the device
 */
var closestPointToCurrentPosition;
var lanuvPm10;
var visArea = document.getElementById("visArea");
var cameraOrientation=0;
var direction;
var date = "1";
var arrowOrigin;
var arrowDestination;

// this variable stores the current position of the device
x = {
  currentPositionInternal: undefined,
  currentPositionListener: [],
  // update the internal value for the position and trigger the listeners if the postion has changed
  set currentPosition(val) {
    if (!this.currentPositionInternal || this.currentPositionInternal.coords !== val.coords) {
      this.currentPositionInternal = val;
      this.currentPositionListener.forEach(function (listener) {
        listener.function(val);
      });
    }
  },
  // return the position
  get currentPosition() {
    return this.currentPositionInternal;
  },
  // add a new listener which is triggered when th position changes. All listers must have unique names
  registerListener: function(listener,name) {

    this.currentPositionListener = this.currentPositionListener.filter(function( obj ) {
      return obj.name !== name;
    });

    this.currentPositionListener.push({
      name: name,
      function: listener
    });
  },
  // call all listeners with the current value of the position
  callListeners: function(position) {
    this.currentPositionListener.forEach(function (listener) {
      listener.function(position);
    });
  }
};


// "mylogger" logs to the console
//@see http://js.jsnlog.com/
//var consoleAppender = JL.createConsoleAppender('consoleAppender');
JL("mylogger").setOptions({"appenders": []});

// this is similar to an endless loop which keeps on calling the function "getDirection"
Promise.resolve().then(function resolver() {
  return getPosition()
    .then(function (position) {
      x.currentPosition = position;
    })
    .then(resolver)
    .catch(console.error);
}).catch(console.error);

/**
 * Get current gps position
 * @returns {Promise<any>}
 */
function getPosition() {
  return new Promise(function(resolve, reject) {
    try {
      navigator.geolocation.getCurrentPosition(function (position) {
        resolve(position);
      });
    } catch (e) {
      reject(e);
    }
  });
}


/**
 * Calculates the angle between two coordinates. An angle of 0 is straight north.
 * @author https://stackoverflow.com/a/9614122
 * @param lat1
 * @param lng1
 * @param lat2
 * @param lng2
 * @returns theta - the angle
 */
function getAngle(lat1, lng1, lat2, lng2) {
  var dy = lng2 - lng1;
  var dx = lat2 - lat1;
  var theta = Math.atan2(dy, dx); // range (-PI, PI]
  theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  //if (theta < 0) theta = 360 + theta; // range [0, 360)
  return theta;
}


//------------------- Guide Areas ----------------------------------------

/**
 * This function triggers the visualization of the guide areas in AR and also implements the listener that will make sure
 * that the option for explanatory text is activated once you are close enough to a guide area.
**@param dataArray
*/
function loadGuideAreas(dataArray) {
  addGuideAreas(dataArray);
  x.registerListener(function(val) {
    checkForGuideArea(dataArray,val);
  }, "guide-areas");
  if (x.currentPosition) {
    x.callListeners(x.currentPosition);
  }
}

/**
 * This function checks if there are guide areas nearby.
 * If a guide area is within a set radius (0.000001 degree) then the corresponding popup will be enabled.
 * @param dataArray - contains the guide areas
 * @param position - the current position
 */
function checkForGuideArea(dataArray, position) {
  let possibleGuideAreas = getClosest(dataArray,position);
  if (possibleGuideAreas.distance < 0.1) {
    addGuide(possibleGuideAreas.closest.text);
  } else {
    removeGuide();
  }
}

/**
 * Visualizes the guide areas in AR, by adding them as Aframe-components to the html page
 *@param dataArray - contains the guide areas
 */
function addGuideAreas(dataArray){
  JL("mylogger").info("--------visualizeData()--------");
  let scene = document.querySelector('a-scene');

  dataArray.forEach((place) => {
    let latitude = place.lat;
    let longitude = place.lon;

    // add geometry for guide area
    let icon = document.createElement('a-torus');
		icon.setAttribute('position', '0 -5 0');
		icon.setAttribute('gps-entity-place', `latitude: ` + latitude + `; longitude: `+ longitude + `;`);
    icon.setAttribute('name', place.name);
    icon.setAttribute('color', place.color);
    icon.setAttribute('rotation', '-90 0 0');
    icon.setAttribute('radius', '1');
    icon.setAttribute('radius-tubular', '0.05');
		icon.setAttribute('material', 'opacity: 0.6');

    // for debug purposes, just show in a bigger scale, otherwise I have to personally go on places...
    icon.setAttribute('scale', '5 5 5');

    icon.addEventListener('loaded', () => window.dispatchEvent(new CustomEvent('gps-entity-place-loaded')));
    scene.appendChild(icon);
  });
}



//------------------- Navigation Arrow ----------------------------------------

/**
 * Load the data and then use it for the navigation with the arrow and the distance to the closest measurement
 * @param dataArray - contains data on the air quality measured with the bike
 */
function startNavigation(dataArray) {
  let distDiv = document.getElementById("distance");
  // this listener updates html component that displays the distance to the closest measurement and also updates
  // the global variable "direction" which stores the direction in which the arrow is pointing
  x.registerListener(function(val) {
    let directionCoordinate = getDirectionCoordinate(dataArray,val);
    direction = getAngle(val.coords.latitude, val.coords.longitude, directionCoordinate.lat, directionCoordinate.lon);
    let closestDistance = getClosest(dataArray,val).distance;
    arrowOrigin = val;
    arrowDestination = directionCoordinate;
    distDiv.innerHTML = "Closest Data Point: " + (Math.round(closestDistance * 100) / 100) + " km";
    distDiv.style.visibility = "visible";
  }, "direction");
  // this links google maps to the html component that displays the distance
  distDiv.onclick = function(){urlToNavMap()};
  // this listener updates the particles and the air quality gauge
  x.registerListener(function(val) {
    let closest = getClosest(dataArray,val).closest;
    if (!closestPointToCurrentPosition) {
      closestPointToCurrentPosition = closest;
    }
    let closestLanuvPm10 = getClosest(getLanuvPm10(), val).closest.pm10;
    if (closestPointToCurrentPosition !== closest || lanuvPm10 !== closestLanuvPm10) {
      closestPointToCurrentPosition = closest;
      lanuvPm10 = closestLanuvPm10;
      visualizeParticles(closest.pm10);
      redrawGauge(closest.pm10,closestLanuvPm10);
    }
  }, "particles");
  if (x.currentPosition) {
    x.callListeners(x.currentPosition);
  }
}




/**
* Calculates the closest element of the given dataArray to a given position.
* @param dataArray - contains data which is geolocated
* @param position - lats and longs of a position
*/
function getClosest(dataArray,position) {
  let closest = dataArray[0];
  let minDistance = Infinity;
  dataArray.forEach(function (current) {
    let currentDistance = distance(current.lat, current.lon, position.coords.latitude, position.coords.longitude, "K");
    if (currentDistance < minDistance) {
      minDistance = currentDistance;
      closest = current;
    }
  });
  return {
    closest: closest,
    distance: minDistance
  };
}





/**
 * this retrieves the current position and calculates the direction from it. The direction is then saved in the global
 * variable called direction.
 * @param dataArray - contains data which is geolocated
 * @param position
 */
function getDirectionCoordinate(dataArray,position) {
  let closest = getClosest(dataArray,position).closest;
  let directionCoordinate = dataArray.find(coordinate => coordinate.name === closest.name + 2);
  if (!directionCoordinate) {
    directionCoordinate = dataArray.find(coordinate => coordinate.name === closest.name + 1);
    if (!directionCoordinate) {
      directionCoordinate = closest;
    }
  }
  return directionCoordinate;
}

/**
 * calculate the distance between two points
 * @author GeoDataSource.com (C) All Rights Reserved 2018
 * @param lat1 - latitude of the first point
 * @param lon1 - longitude of the first point
 * @param lat2 - latitude of the second point
 * @param lon2 - longitude of the second point
 * @param unit - "K" for kilometers, "N" for ..., else in miles
 * @returns {number} - returns distance in the specified unit
 */
function distance(lat1, lon1, lat2, lon2, unit) {
  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
  }
  else {
    var radlat1 = Math.PI * lat1/180;
    var radlat2 = Math.PI * lat2/180;
    var theta = lon1-lon2;
    var radtheta = Math.PI * theta/180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit==="K") { dist = dist * 1.609344 }
    if (unit==="N") { dist = dist * 0.8684 }
    return dist;
  }
}

//------------------- Gauge ----------------------------------------

/**
* Everytime the gauge has to be updated this function is called to redraw it entirely based on the given values.
* @param pointerBike - pm10 value of the bike
* @param pointerLanuv - pm10 value of the lanuv station
*/
function redrawGauge(pointerBike,pointerLanuv) {
  if (linearGauge) {
    linearGauge
      // draw max and min
      .draw("0", "65")
      // draw steps between min and max (like steps on a ruler)
      .drawStep(10, "#d9d9d9", 5)
      .drawStep(20, "#d9d9d9", 5)
      .drawStep(30, "#d9d9d9", 5)
      .drawStep(40, "#d9d9d9", 5)
      .drawStep(50, "#d9d9d9", 5)
      .drawStep(60, "#d9d9d9", 5)
      // draw value for lanuv station
      .drawPointer((pointerLanuv>62) ? 62 : (pointerLanuv<0) ? 0 : pointerLanuv, "#b38e00", "" + Math.round(pointerLanuv * 100) / 100)
      // draw value for bike measurement
      .drawPointer((pointerBike>62) ? 62 : (pointerBike<0) ? 0 : pointerBike, "#ffdb4d", "" + Math.round(pointerBike * 100) / 100)				;
  } else {
    linearGauge = new HyyanAF.LinearGauge(gauge,0,65)
      // draw max and min
      .draw("0", "65")
      // draw steps between min and max (like steps on a ruler)
      .drawStep(10, "#d9d9d9", 5)
      .drawStep(20, "#d9d9d9", 5)
      .drawStep(30, "#d9d9d9", 5)
      .drawStep(40, "#d9d9d9", 5)
      .drawStep(50, "#d9d9d9", 5)
      .drawStep(60, "#d9d9d9", 5)
      // draw value for lanuv station
      .drawPointer((pointerLanuv>62) ? 62 : (pointerLanuv<0) ? 0 : pointerLanuv, "#b38e00", "" + Math.round(pointerLanuv * 100) / 100)
      // draw value for bike measurement
      .drawPointer((pointerBike>62) ? 62 : (pointerBike<0) ? 0 : pointerBike, "#ffdb4d", "" + Math.round(pointerBike * 100) / 100)
    ;
  }
}



//------------------- Gauge Guide ----------------------------------------


/**
 * This function adds the explanatory text of a guide to the scene. If theres already an active guide its text will be replaced.
 * An explanatory text consists of a button and a popup (a-entity with a plane and text) for the content.
 * The button is for opening and closing the popup.
 * @param content - content for the guide
 */
function addGuide(content) {
  let popupBtn = document.getElementById("popupBtn");
  if (popupBtn === null) {
    let btnContainer = document.getElementById("guide-buttons");
    let popupBtn = document.createElement("button");
    popupBtn.setAttribute("id", "popupBtn");
    popupBtn.onclick = returnOpenClosePopup();
    popupBtn.innerText = "info";
    btnContainer.appendChild(popupBtn);
  }
  let guidePane = document.getElementById("guideContent");
  guidePane.innerText = content;
}

/**
 * This function removes active guides.
 */
function removeGuide() {
  let guidePane = document.getElementById("guideContent");
  guidePane.setAttribute("visible",false);
  let popupBtn = document.getElementById("popupBtn");
  if (popupBtn !== null) {
    popupBtn.parentNode.removeChild(popupBtn);
  }
}

/**
 * This function returns a function for opening and closing popups.
 * @returns {Function}
 */
function returnOpenClosePopup() {
    return function() {
      var guidePane = document.getElementById("guideAreaInfo");
      if(guidePane.style.visibility === "hidden"){
        guidePane.style.visibility = "visible";
      }
      else{
        guidePane.style.visibility = "hidden";
      }
    };
}

/**
* Function for opening and closing popups.
*/
function openClosePopup() {
  var guidePane = document.getElementById("guideAreaInfo");
  if(guidePane.style.visibility === "hidden"){
    guidePane.style.visibility = "visible";
  }
  else{
    guidePane.style.visibility = "hidden";
  }
}

/**
* Returns the data measured by the two lanuv stations during the time of the bike trip.
* @return lanuv - an array containing the values
*/
function getLanuvPm10(){
  let lanuv = [];
  // 11th of december
  if(date === "2"){
    lanuv1912.forEach(function (e){
      if(e.time.getHours() === closestPointToCurrentPosition.time.getHours()) {
        lanuv.push({
          lat: 51.953289,
          lon: 7.619380,
          pm10: e.pm10_Weseler
        });
        lanuv.push({
          lat: 51.936482,
          lon: 7.611618,
          pm10: e.pm10_Geist
        });
      }
    });
  }
  // 14th of november
  else
  {
    lanuv1411.forEach(function (e){
      if(e.time.getHours() === closestPointToCurrentPosition.time.getHours()) {
        lanuv.push({
          lat: 51.953289,
          lon: 7.619380,
          pm10: e.pm10_Weseler
        });
        lanuv.push({
          lat: 51.936482,
          lon: 7.611618,
          pm10: e.pm10_Geist
        });
      }
    });
  }
  return lanuv;
}


//------------------- Particles ----------------------------------------

/**
 * This function visualizes the particles in the AR.
 *@param pm10Value
 */
function visualizeParticles(pm10Value){
  JL("mylogger").info("--------visualizeParticles()--------");

  if (document.getElementById("particles " + pm10Value) === null) {
    // remove all other particle-systems
    let alreadyExisting = document.querySelectorAll('[id^="particles"]');
    alreadyExisting.forEach(function(current) {
      current.parentNode.removeChild(current);
    });
    // add particle icon
    let scene = document.querySelector('a-scene');
    let dust = document.createElement('a-entity');
    dust.setAttribute('position', '0 2.25 -15');
    dust.setAttribute('id', 'particles ' + pm10Value);
    pm10ValueVisualized = Math.floor(translateRange(pm10Value, 65, 0, 200000, 0));
    dust.setAttribute('particle-system', 'preset: dust; particleCount: ' + pm10ValueVisualized + ';  color: #61210B, #61380B, #3B170B');
    scene.appendChild(dust);
  }
}


//------------------- Introduction ----------------------------------------

/**
 *Function that controlles the content of the introduction.
 * @param step Number between 1 and 6, displays page of introduction
 */
function introduction(step){
  var information = document.getElementById("information");
  information.style.display = "none";
  var introduction = document.getElementsByClassName("introduction");
  for(var i = 0; i < introduction.length; i++) {
    introduction[i].style.display = "flex";
  }



  var introduction1 = document.getElementById("introduction-1");
  var introduction2 = document.getElementById("introduction-2");
  var introduction3 = document.getElementById("introduction-3");
  var introduction4 = document.getElementById("introduction-4");
  var introduction5 = document.getElementById("introduction-5");
  introduction1.style.display = "none";
  introduction2.style.display = "none";
  introduction3.style.display = "none";
  introduction4.style.display = "none";
  introduction5.style.display = "none";

  switch (step){
    case 1:
      introduction1.style.display = "flex";
      document.getElementById("gaugeContainer").style.visibility = "hidden";
      document.getElementById("distance").style.visibility = "hidden";
      document.getElementById("arrow").setAttribute("visible",false);
      visualizeParticles(5);
      break;

    case 2:
      introduction2.style.display = "flex";
      visualizeParticles(40);
      break;

    case 3:
      introduction3.style.display = "flex";
      visualizeParticles(15);
      break;

    case 4:
      introduction4.style.display = "flex";
      document.getElementById("gaugeContainer").style.visibility = "visible";
      document.getElementById("distance").style.visibility = "visible";
      document.getElementById("arrow").setAttribute("visible",true);
      break;

    case 5:
      introduction5.style.display = "flex";
      break;

    case 6:
      for(var i = 0; i < introduction.length; i++) {
        introduction[i].style.display = "none";
      }
      loadContent("1");
      break;
  }
}

//------------------- Menue ----------------------------------------
/**
* hides or shows the information block on top of the AR
*/
function showAndHideInformation(){

  var information = document.getElementById("information");

  if(information.style.display === "none"){
    var introduction = document.getElementsByClassName("introduction");
    for(var i = 0; i < introduction.length; i++) {
      introduction[i].style.display = "none";
    }
    information.style.display = "flex";

  }
  else{
    information.style.display = "none";

  }
}

/**
* Set the date according to the range slider in the menu, hide the menu and reload the Content to match the new date.
*/
function setDate(){
  date =  document.getElementById("range").value;

  showAndHideInformation();
  loadContent(date);
}

//------------------- Map ----------------------------------------
/**
* opens Google Maps with the route to the next routing point (which the navigation arrow points on)
*/
function urlToNavMap(){

  var information = document.getElementById("distance");
  try {
    var destinationCoord = getDirectionCoordinate();
    var originCoord = getCurrentPosition();
    if(destinationCoord == NULL || originCoord == NULL){
      throw "destinationCoord or originCoord is null.";
    }
    var url ="https://www.google.com/maps/dir/?api=1&origin="+arrowOrigin.coords.latitude+"%2C"+arrowOrigin.coords.longitude+"&destination="+arrowDestination.lat+"%2C"+arrowDestination.lon+"&travelmode=walking";
  } catch (e) {
    var url ="https://drive.google.com/open?id=1wKBvzSgLyZSQiVaxqd-n2ABefUzxqcMY&usp=sharing";
  } finally {
    console.log(originCoord);
    console.log(destinationCoord);
    console.log(url);
    window.open(url);
  }
}




//------------------- Initial Function after Introduction ----------------------------------------

/**
 * This function retrieves the relevant data for the given date and then loads the guide areas and starts the navigation.
 *@param date - the date of the bike trip
 */
function loadContent(date) {

  readAllData()
    .then(function () {
      loadGuideAreas((date === "1") ? guide1411 : guide1912);
      startNavigation((date === "1") ? bike1411 : bike1912);
    });
}
