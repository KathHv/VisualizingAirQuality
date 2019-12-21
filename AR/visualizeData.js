/**
 * @author Katharina Hovestadt, Paula Scharf
 */

/**
 * initialzing variables
 *@param url: URL to the csv-file which contains the data
 *@param currentPosition: current position of the device [lat,lng]
 *@param closestPointToCurrentPosition: point with clostest point on route according to the current position
 *@param visArea: area in document where something can be visualized
 */
var url = "../data/";
var currentPosition;
var closestPointToCurrentPosition;
var visArea = document.getElementById("visArea");
var cameraOrientation=0;
var direction;

// "mylogger" logs to just the console
//@see http://js.jsnlog.com/
var consoleAppender = JL.createConsoleAppender('consoleAppender');
JL("mylogger").setOptions({"appenders": [consoleAppender]});


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

/**
 * load and then read Data from csv file
 * @param input - the name of the csv from which the data is loaded
 */
function promiseToLoadData(input) {
    return new Promise(function(resolve, reject) {
        JL("mylogger").info("--------loadData()--------");
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    if (this.responseText.length === 0) {
                        JL("mylogger").error("The URL field or the content of the field is emtpy.1");
                    }
                    JL("mylogger").info("response Text: " + this.responseText);
                    var dataArray = readData(this.responseText);
                    resolve(dataArray);
                } else {
                    reject("couldnt load");
                }
            }
        };
        xhttp.open("GET", url + input, true);
        xhttp.send();
    });
}

/**
 * read Data out of the submitted responseText
 *@param dataCSV csv text from air quality data
 *@return returns array of processed csv-text
 */
function readData(dataCSV){
    JL("mylogger").info("--------readData()--------");
    var dataArraySplittedByBrake = dataCSV.split("\n");
    dataArraySplittedByBrake.shift();
    JL("mylogger").info("dataArraySplittedByBrake[0]: " + dataArraySplittedByBrake[0]);
    var dataArraySplittedByBrakeAndComma = [];
    var x;
    for (x in dataArraySplittedByBrake){

        var dataElementSplittedByBrakeAndComma = dataArraySplittedByBrake[x].split(",");
        dataElementSplittedByBrakeAndComma.shift();
        dataArraySplittedByBrakeAndComma.push(dataElementSplittedByBrakeAndComma);
    }
    let dataArrayOfObjects = [];
    dataArraySplittedByBrakeAndComma.forEach((item) => {
        let placeObject = {
            name: JSON.parse(item[1]),
            location: {
                lat: parseFloat(item[2]),
                lng: parseFloat(item[3])
            },
            air_quality: {
                airTC: parseFloat(item[4]),
                rH: parseFloat(item[5]),
                pm25: parseFloat(item[6]),
                pm10: parseFloat(item[7])
            }
        };
        dataArrayOfObjects.push(placeObject);
    });
    JL("mylogger").info("read data is ready.");
    return dataArrayOfObjects;
}

function loadGuideAreas(filename) {
    console.log("body has loaded");
    promiseToLoadData(filename)
      .catch(console.error)
      .then(function (dataArray) {
          addGuideAreas(dataArray);
      });
}

/**
* visualizes data in the AR, writes into html
*@param dataArray: array which contains the RELEVANT data of the air quality in format [[timestamp, record, lat, lon, AirTC_Avg, RH_Avg, pm25, pm10], ...]
*/
function addGuideAreas(dataArray){
    JL("mylogger").info("--------visualizeData()--------");
    let scene = document.querySelector('a-scene');

    dataArray.forEach((place) => {
        let latitude = place.location.lat;
        let longitude = place.location.lng;

        // add place icon
        let icon = document.createElement('a-circle');
        icon.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
        icon.setAttribute('height', '0.1');
        icon.setAttribute('name', place.name);
        icon.setAttribute('color', '#f55a42');
        icon.setAttribute('rotation', '0 0 90');

        // for debug purposes, just show in a bigger scale, otherwise I have to personally go on places...
        icon.setAttribute('scale', '5 5 5');

        icon.addEventListener('loaded', () => window.dispatchEvent(new CustomEvent('gps-entity-place-loaded')));
        scene.appendChild(icon);
    });
}


/**
 * Load the data and then use it for the navigation
 */
function startNavigation() {
    promiseToLoadData("example.csv")
        .catch(console.error)
        .then(function (dataArray) {
            getDirection(dataArray)
                .catch(console.error);

            window.setInterval(getDirection, 5000, dataArray)
        });
}

/**
 * this retrieves the current position and calculates the direction from it. The direction is then saved in the global
 * variable called direction.
 * @param dataArray - the route points
 * @returns {Promise}
 */
function getDirection(dataArray) {
    return new Promise(function(resolve, reject) {
        navigator.geolocation.getCurrentPosition(function (position) {
            try {
                let closest = dataArray[0];
                let minDistance = Infinity;
                dataArray.forEach(function (current) {
                    let currentDistance = distance(current.location.lat, current.location.lng,
                        position.coords.latitude, position.coords.longitude, "K");
                    if (currentDistance < minDistance) {
                        minDistance = currentDistance;
                        closest = current;
                    }
                });
                let directionCoordinate = closest;//dataArray.find(coordinate => coordinate.name === closest.name + 2);
                direction = getAngle(position.coords.latitude, position.coords.longitude,
                    directionCoordinate.location.lat, directionCoordinate.location.lng);

                closestPointToCurrentPosition = dataArray.find(coordinate => coordinate.name === closest.name);
                visualizeParticles(getPM10(dataArray));

                resolve();
            } catch (e) {
                reject(e);
            }
        });
    });
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



// visualize visualizeParticles
/*
* visualizes data in the AR, writes into html
*@param dataArray: array which contains the RELEVANT data of the air quality in format [[timestamp, record, lat, lon, AirTC_Avg, RH_Avg, pm25, pm10], ...]
*/
function visualizeParticles(pm10Value){
    JL("mylogger").info("--------visualizeParticles()--------");
    let scene = document.querySelector('a-scene');

        // add particle icon
        let dust = document.createElement('a-entity');
        dust.setAttribute('position', '0 2.25 -15')
        pm10ValueVisualized = pm10Value * 1000;
        dust.setAttribute('particle-system', 'preset: dust; particleCount: ' + pm10ValueVisualized+';  color: #61210B, #61380B, #3B170B');
        scene.appendChild(dust);
}

function getPM10(){
  pm10 = closestPointToCurrentPosition.air_quality.pm10;
  return pm10;
}

/**
 * select data that is around the current position of the device from the array
 * @param currentPosition - array containing the lat and long info of the current position
 * @param dataArray - array which contains objects with coordinates
 * @param radius - radius around current position (in degree)
 * @return array with relevant objects
 * @example selectData([51.2,7.3], [...], 0.00001)
 */
function selectData(currentPosition, dataArray, radius){
    //JL("mylogger").info("--------selectData()--------");
    var relevantDataArray = [];

    dataArray.forEach(function (current) {
        //push all relevant value sets to the relevantDataArray
        if(
          (currentPosition[0] < (current.coordinates.lat + radius)
            && (currentPosition[1] < (current.coordinates.lng + radius)
              || currentPosition[1] > (current.coordinates.lng - radius))
          )
          || (currentPosition[0] > (current.coordinates.lat - radius)
            && (currentPosition[1] < (current.coordinates.lng + radius)
            || currentPosition[1] > (current.coordinates.lng - radius))
          )
        ){
            relevantDataArray.push(current);
        }
    });
    JL("mylogger").info("relevantDataArray: "+ relevantDataArray);
    return relevantDataArray;

}