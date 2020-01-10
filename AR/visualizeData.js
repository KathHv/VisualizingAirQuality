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
var closestPointToCurrentPosition;
var visArea = document.getElementById("visArea");
var cameraOrientation=0;
var direction;
var guideAreas;
x = {
    currentPositionInternal: undefined,
    currentPositionListener: [],
    set currentPosition(val) {
        if (!this.currentPositionInternal || this.currentPositionInternal.coords !== val.coords) {
            this.currentPositionInternal = val;
            this.currentPositionListener.forEach(function (listener) {
                listener.function(val);
            });
        }
    },
    get currentPosition() {
        return this.currentPositionInternal;
    },
    registerListener: function(listener,name) {
        let alreadyExisting = false;

        this.currentPositionListener.forEach(function (current) {
            if (current.name === name) {
                alreadyExisting = true;
            }
        });

        if (!alreadyExisting) {
            this.currentPositionListener.push({
                name: name,
                function: listener
            });
        }
    }
};


// "mylogger" logs to just the console
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
                    resolve(this.responseText);
                } else {
                    reject("couldnt load " + input);
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
    promiseToLoadData(filename)
      .catch(console.error)
      .then(function (response) {
          let dataArray = JSON.parse(response).areas;
          addGuideAreas(dataArray);
          x.registerListener(function(val) {
                  checkForGuideArea(dataArray,val);
          }, "guide-areas");
      });
}

/**
 * This function checks if there are guide areas nearby.
 * If a guide area is within a set radius (0.000001 degree) then the corresponding popup will be enabled.
 * CURRENTLY THIS METHOD SEEMS TO BE SELECTING ALL GUIDE AREAS. MAYBE THERE'S A PROBLEM WITH "selectData".
 * @param dataArray - contains the guide areas
 * @param position - the current position
 */
function checkForGuideArea(dataArray, position) {
    let possibleGuideAreas = getClosest(dataArray,position);
    if (possibleGuideAreas.distance < 0.5) {
        addGuide(possibleGuideAreas.closest.text);
    } else {
        removeGuide();
    }
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
        let icon = document.createElement('a-ring');
        icon.setAttribute('gps-entity-place', `latitude: ` + latitude + `; longitude: `+ longitude + `;`);
        icon.setAttribute('name', place.name);
        icon.setAttribute('color', '#f55a42');
        icon.setAttribute('rotation', '-90 0 0');
        icon.setAttribute('radius-inner', '1');
        icon.setAttribute('radius-outer', '1.2');
        icon.setAttribute('height', '-5');

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
        .then(function (response) {
            let dataArray = readData(response);
            let distDiv = document.getElementById("distance");
            x.registerListener(function(val) {
                let directionCoordinate = getDirectionCoordinate(dataArray,val);
                direction = getAngle(val.coords.latitude, val.coords.longitude, directionCoordinate.location.lat, directionCoordinate.location.lng);
                distDiv.innerHTML = (Math.round(distance(val.coords.latitude, val.coords.longitude,
                  directionCoordinate.location.lat, directionCoordinate.location.lng, "K") * 100) / 100) + " km";
                distDiv.style.visibility = "visible";
            }, "direction");
            x.registerListener(function(val) {
                let closest = getClosest(dataArray,val).closest;
                if (closestPointToCurrentPosition !== closest) {
                    closestPointToCurrentPosition = closest;
                    visualizeParticles(closest.air_quality.pm10);
                }
            }, "particles");
        });
}

function getClosest(dataArray,position) {
    let closest = dataArray[0];
    let minDistance = Infinity;
    dataArray.forEach(function (current) {
        let currentDistance = dist ance(current, position, "K");
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
 * @param dataArray - the route points
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



/**
* visualizes data in the AR, writes into html
*@param pm10Value
*/
function visualizeParticles(pm10Value){
    JL("mylogger").info("--------visualizeParticles()--------");

    if (document.getElementById("particles " + pm10Value) === null) {
        // remove all other particle-systems
        let alreadyExisting = document.querySelectorAll('[id^="particles"]');
        alreadyExisting.forEach(function(current) {
            alreadyExisting.parentNode.removeChild(current);
        });
        // add particle icon
        let scene = document.querySelector('a-scene');
        let dust = document.createElement('a-entity');
        dust.setAttribute('position', '0 2.25 -15');
        dust.setAttribute('id', 'particles ' + pm10Value);
        pm10ValueVisualized = pm10Value * 1000;
        dust.setAttribute('particle-system', 'preset: dust; particleCount: ' + pm10ValueVisualized + ';  color: #61210B, #61380B, #3B170B');
        scene.appendChild(dust);
    }
}

/**
 * This function adds the guide to the scene. If theres already an active guide its content will be replaced.
 * A guide consists of a button and a popup (a-entity with a plane and text) for the content.
 * The button is for opening and closing the popup.
 * @param content - content for the guide
 */
function addGuide(content) {
    let existingPopup = document.getElementById( 'popup' );
    if (existingPopup === null) {
        // button
        let btnContainer = document.getElementById("guide-buttons");
        let popupBtn = document.createElement("button");
        popupBtn.setAttribute("id", "popupBtn");
        popupBtn.onclick = openClosePopup();
        popupBtn.innerText = "info";
        btnContainer.appendChild(popupBtn);
        // the popup
        let popup = document.createElement("a-entity");
        popup.setAttribute("id", "popup");
        popup.setAttribute("geometry", "primitive: plane; height: auto; width: 1");
        popup.setAttribute("material", "color: blue");
        popup.setAttribute("text", "wrapCount:10; value: " + content);
        popup.setAttribute("position", "0 3 -5");
        popup.setAttribute("visible", false);
        let ppContainer = document.getElementById("camera");
        ppContainer.appendChild(popup)
    } else {
        existingPopup.setAttribute("text", "wrapCount:10; value: " + content);
    }

}

/**
 * This function removes active guides.
 */
function removeGuide() {
    let popupBtn = document.getElementById("popupBtn");
    let popup = document.getElementById("popup");
    if (popupBtn !== null) {
        popupBtn.parentNode.removeChild(popupBtn);
    }
    if (popup !== null) {
        popup.parentNode.removeChild(popup);
    }
}

/**
 * This function returns a function for opening and closing popups.
 * @returns {Function}
 */
function openClosePopup() {
    return function() {
        let popup = document.getElementById("popup");
        if (popup !== null) {
            popup.setAttribute("visible", !(popup.getAttribute("visible") === true));
        }
    };
}

/**
 *
 */
function loadContent() {
    loadGuideAreas('guide_areas.json');
    startNavigation();
    readAllData();
}
