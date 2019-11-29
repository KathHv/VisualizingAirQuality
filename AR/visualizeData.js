/*
* @author Katharina Hovestadt
*/

/*
* initialzing variables
*@param url: URL to the csv-file which contains the data
*@param currentPosition: current position of the device [lat,lng]
*@param visArea: area in document where something can be visualized
*/
var url = "/data/bike_14-11.csv";
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




/*
function processData(){
  var loadedData=null;
  var selectedData=null;

  loadedData = loadData();
  JL("mylogger").info("loadedData: " + loadedData);

  selectedData = selectData(loadedData);
  JL("mylogger").info("selectedData: " + selectedData);

  //var visualizedData = visualizeData(readData);
  //JL("mylogger").info("visualizedData: " + visualizedData);

}*/

/*
* load Data from csv file
*@return: array with air quality data in format: [[timestamp, record, lat, lon, AirTC_Avg, RH_Avg, pm25, pm10], ...]
*/
function loadData(){

    //JL("mylogger").info("--------loadData()--------");
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText.length == 0){
                //JL("mylogger").error("The URL field or the content of the field is emtpy.1");
            }
            //JL("mylogger").info("response Text: " + this.responseText);
            var dataArray = readData(this.responseText);
            loadedData = dataArray;
            visualizeData(loadedData);
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}


/*
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
                lat: JSON.parse(item[2]),
                lng: JSON.parse(item[3])
            },
            air_quality: {
                airTC: JSON.parse(item[4]),
                rH: JSON.parse(item[5]),
                pm25: JSON.parse(item[6]),
                pm10: JSON.parse(item[7])
            }
        };
        dataArrayOfObjects.push(placeObject);
    });
    //JL("mylogger").info("read data is ready.");
    return dataArrayOfObjects;
}


/*
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

    for (let i = 0; i < dataArray.length; i++) {
        let place = dataArray[i];

        const latitude = place.location.lat;
        const longitude = place.location.lng;

        // add place icon
        const icon = document.createElement('a-image');
        icon.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);
        icon.setAttribute('name', place.name);
        let imageSrc = "";
        let expression = place.air_quality.pm10;
        switch(true) {
            case (expression < 5):
                console.log("green");
                imageSrc = './markers/map-marker_green.png';
                break;
            case (expression > 5 && expression < 6):
                console.log("orange");
                imageSrc = './markers/map-marker_orange.png';
                break;
            case (expression > 6):
                console.log("red");
                imageSrc = './markers/map-marker_red.png';
                break;
        }
        icon.setAttribute('src', imageSrc);

        // for debug purposes, just show in a bigger scale, otherwise I have to personally go on places...
        icon.setAttribute('scale', '20, 20');

        icon.addEventListener('loaded', () => window.dispatchEvent(new CustomEvent('gps-entity-place-loaded')));

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

        scene.appendChild(icon);
    };
}


function loadAndRenderMarkerLocationsExample() {
    let places = LoadExamplePlaces();
    visualizeData(places);
}

function loadAndRenderMarkerLocationsBike() {
    loadData()
}

function LoadExamplePlaces() {
    return [
        {
            name: "location 1",
            location: {
                lat: 51.972799888098116, // add here latitude if using static data
                lng: 7.5600528717041025 // add here longitude if using static data
            },
            air_quality: {
                airTC: 8.12,
                rH: 67.14,
                pm25: 1.68,
                pm10: 4.04
            }
        },
        {
            name: 'location 2',
            location: {
                lat: 51.97263465419644,
                lng: 7.559886574745177
            },
            air_quality: {
                airTC: 9.12,
                rH: 69.14,
                pm25: 2.68,
                pm10: 5.04
            }
        },
        {
            name: 'location 3',
            location: {
                lat: 51.972442982107154,
                lng: 7.5598543882369995
            },
            air_quality: {
                airTC: 10.12,
                rH: 71.14,
                pm25: 3.68,
                pm10: 6.04
            }
        },
        {
            name: 'location 4',
            location: {
                lat: 51.97227774688935,
                lng: 7.559940218925476
            },
            air_quality: {
                airTC: 10.12,
                rH: 71.14,
                pm25: 3.68,
                pm10: 1.0
            }
        },
        {
            name: 'location 4',
            location: {
                lat: 51.97212242522909,
                lng: 7.560095787048341
            },
            air_quality: {
                airTC: 10.12,
                rH: 71.14,
                pm25: 3.68,
                pm10: 5.5
            }
        }
    ];
}
