/**
 * @author Katharina Hovestadt, Paula Scharf
 */

/**
 * initialzing variables
 *@param url: URL to the csv-file which contains the data
 *@param currentPosition: current position of the device [lat,lng]
 *@param visArea: area in document where something can be visualized
 */
var url = "data/";
var currentPosition;
var visArea = document.getElementById("visArea");
var loadedData=null;
var selectedData=null;

// "mylogger" logs to just the console
//@see http://js.jsnlog.com/
//var consoleAppender = JL.createConsoleAppender('consoleAppender');
//JL("mylogger").setOptions({"appenders": [consoleAppender]});


function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    x.innerHTML = "Latitude: " + position.coords.latitude +
        "<br>Longitude: " + position.coords.longitude;
}


/**
 * load Data from csv file
 *@return: array with air quality data in format: [[timestamp, record, lat, lon, AirTC_Avg, RH_Avg, pm25, pm10], ...]
 */
function loadData(input){

    //JL("mylogger").info("--------loadData()--------");
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            if (this.responseText.length === 0){
                //JL("mylogger").error("The URL field or the content of the field is emtpy.1");
            }
            //JL("mylogger").info("response Text: " + this.responseText);
            var dataArray = readData(this.responseText);
            loadedData = dataArray;
            visualizeData(loadedData);
        }
    };
    xhttp.open("GET", url + input, true);
    xhttp.send();
}


/**
 * read Data out of the submitted responseText
 *@param dataCSV csv text from air quality data
 *@return returns array of processed csv-text in form [[timestamp, record, lat, lon, AirTC_Avg, RH_Avg, pm25, pm10], ...]
 */
function readData(dataCSV){
    //JL("mylogger").info("--------readData()--------");
    var dataArraySplittedByBrake = dataCSV.split("\n");
    dataArraySplittedByBrake.shift();
//    JL("mylogger").info("dataArraySplittedByBrake[0]: " + dataArraySplittedByBrake[0]);
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
            name: "location" + item[1],
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
    //JL("mylogger").info("read data is ready.");
    return dataArrayOfObjects;
}


/**
 * select data that is around the current position of the device from the array
 *@param dataArray: array which contains data of the air quality
 *@return: array with relevant air quality data in format: [[timestamp, record, lat, lon, AirTC_Avg, RH_Avg, pm25, pm10], ...]
 */
function selectData(dataArray){
    //JL("mylogger").info("--------selectData()--------");
    var relevantDataArray = null;
    var radius = 0.00001;

    var x;
    for (x in dataArray){
        //push all relevant value sets to the relevantDataArray

        if(
            (currentPosition[0] < (dataArray[x][2] + radius)
                && (currentPosition[1] < (dataArray[x][3] + radius)
                    || currentPosition[1] > (dataArray[x][3] - radius))
            )
            || (currentPosition[0] > (dataArray[x][2] - radius)
                && (currentPosition[1] < (dataArray[x][3] + radius)
                || currentPosition[1] > (dataArray[x][3] - radius))
            )
        ){
            //JL("mylogger").info("relevant Position: " +dataArray[x][2]+", "+dataArray[x][3]);
            relevantDataArray.push(dataArray[x]);
        }
        else{
            //JL("mylogger").info("position not relevant.");
        }
    }
    //JL("mylogger").info("relevantDataArray: "+ relevantDataArray);
    selectedData =  relevantDataArray;

}


/*
* visualizes data in the AR, writes into html
*@param dataArray: array which contains the RELEVANT data of the air quality in format [[timestamp, record, lat, lon, AirTC_Avg, RH_Avg, pm25, pm10], ...]
*/
function visualizeData(dataArray){
    //JL("mylogger").info("--------visualizeData()--------");
    let scene = document.querySelector('a-scene');

    dataArray.forEach((place) => {
        let latitude = place.location.lat;
        let longitude = place.location.lng;

        // add place icon
        let icon = document.createElement('a-cylinder');
        icon.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
        icon.setAttribute('height', '0.1');
        icon.setAttribute('name', place.name);
        let color = getColor(place.air_quality.pm10);
        console.dir(color);
        icon.setAttribute('color', color);

        // for debug purposes, just show in a bigger scale, otherwise I have to personally go on places...
        icon.setAttribute('scale', '5 5 5');

        icon.addEventListener('loaded', () => window.dispatchEvent(new CustomEvent('gps-entity-place-loaded')));
        /*
                const clickListener = function (ev) {
                    ev.stopPropagation();
                    ev.preventDefault();
                    const name = ev.target.getAttribute('name');
                    const el = ev.detail.intersection && ev.detail.intersection.object.el;
                    if (el && el === ev.target) {
                        const label = document.createElement('span');
                        const container = document.createElement('div');
                        container.setAttribute('id', 'place-label');
                        label.innerText = name;
                        container.appendChild(label);
                        document.body.appendChild(container);
                        setTimeout(() => {
                            container.parentElement.removeChild(container);
                        }, 1500);
                    }
                };
                icon.addEventListener('click', clickListener);
        */
        scene.appendChild(icon);
    });
}

function getColor(input) {
    let rainbow = new Rainbow();
    rainbow.setNumberRange(1, 30);
    rainbow.setSpectrum('green', 'red');
    let hexColour = rainbow.colourAt(input);
    return '#' + hexColour;
}


function loadAndRenderMarkerLocationsExample() {
    loadData("example.csv");
}

function loadAndRenderMarkerLocationsBike() {
    loadData("bike_14-11.csv");
}