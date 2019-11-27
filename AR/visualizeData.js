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
var currentPosition = getLocation();
var visArea = document.getElementById("visArea");
var loadedData=null;
var selectedData=null;


// "mylogger" logs to just the console
//@see http://js.jsnlog.com/
var consoleAppender = JL.createConsoleAppender('consoleAppender');
JL("mylogger").setOptions({"appenders": [consoleAppender]});


/*
* load Data from csv file
*@return: array with air quality data in format: [[timestamp, record, lat, lon, AirTC_Avg, RH_Avg, pm25, pm10], ...]
*/
function loadData(){

  JL("mylogger").info("--------loadData()--------");
    var xhttp = new XMLHttpRequest();

   xhttp.onreadystatechange = function() {
       if (this.readyState == 4 && this.status == 200) {
        if (this.responseText.length == 0){
            JL("mylogger").error("The URL field or the content of the field is emtpy.1");
        }
        JL("mylogger").info("response Text: " + this.responseText);
        var dataArray = readData(this.responseText);
        loadedData = dataArray;
        selectData(loadedData);
        //getLocation(loadedData);
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
  JL("mylogger").info("--------readData()--------");
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
  JL("mylogger").info("read data is ready.");
  return dataArraySplittedByBrakeAndComma
}


/*
* get location of the device and write it into the global variabel currentPosition[lat, lng]
*/
function getLocation() {
  JL("mylogger").info("--------getLocation()--------");
 if (navigator.geolocation) {
   JL("mylogger").info(navigator.geolocation);
   navigator.geolocation.getCurrentPosition(getCoordinates);
 } else {
   JL("mylogger").warn("Current position is not available.");
 }

}

function getCoordinates(position){
  JL("mylogger").info("--------getCoordinates()--------");
  JL("mylogger").info("current position: " + position.coords.latitude +", "+position.coords.longitude);
  currentPosition = [position.coords.latitude, position.coords.longitude];
}

/*
* select data that is around the current position of the device from the array
*@param dataArray: array which contains data of the air quality
*@return: array with relevant air quality data in format: [[timestamp, record, lat, lon, AirTC_Avg, RH_Avg, pm25, pm10], ...]
*/
function selectData(dataArray){
JL("mylogger").info("--------selectData()--------");
var relevantDataArray = null;
var radius = 0.00001;
JL("mylogger").info(currentPosition);

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
      JL("mylogger").info("relevant Position: " +dataArray[x][2]+", "+dataArray[x][3]);
      relevantDataArray.push(dataArray[x]);
    }
    else{
        JL("mylogger").info("position not relevant.");
    }
}
JL("mylogger").info("relevantDataArray: "+ relevantDataArray);
selectedData =  relevantDataArray;

}


/*
* visualizes data in the AR, writes into html
*@param dataArray: array which contains the RELEVANT data of the air quality in format [[timestamp, record, lat, lon, AirTC_Avg, RH_Avg, pm25, pm10], ...]
*/
function visualizeData(dataArray){
    JL("mylogger").info("--------visualizeData()--------");
}
