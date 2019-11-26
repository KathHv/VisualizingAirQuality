/*
* @author Katharina Hovestadt
*/

/*
* initialzing variables
*@param url: URL to the csv-file which contains the data
*@param currentPosition: current position of the device [lat,lng]
*@param visArea: area in document where something can be visualized
*/
var url = "/data/bike_14-12.csv";
var currentPosition;
var visArea = document.getElementById("visArea");



function processData(){
  var loadedData = loadData();
  JL("mylogger").warn("loadedData: " + loadedData);
  var readData = selectData(loadedData);
  JL("mylogger").warn("readData: " + readData);
  var visualizedData = visualizeData(readData);
  JL("mylogger").warn("visualizedData: " + visualizedData);

}

	document.getElementById('button').onclick = function(e) {
    var loadedData = loadData();
    JL("mylogger").warn("loadedData: " + loadedData);
    var readData = readData(loadedData);
    JL("mylogger").warn("readData: " + readData);
    var visualizedData = visualizeData(readData);
    JL("mylogger").warn("visualizedData: " + visualizedData);

  }

/*
* load Data from csv file
*@return: array with air quality data in format: [[timestamp, record, lat, lon, AirTC_Avg, RH_Avg, pm25, pm10], ...]
*/
function loadData(){
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {

      if (this.readyState == 4 && this.status == 200) {
        if (this.responseText.length == 0){
            JL("mylogger").error("The URL field or the content of the field is emtpy.1");
        }
        JL("mylogger").info(this.responseText);
        var dataArray = readData(this.responseText);
        return dataArray;
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
  var dataArraySplittedByBrake = dataCSV.split["\n"];
  var dataArraySplittedByBrakeAndComma = null;
  var x;
  for (x in dataArraySplittedByBrake){
    var dataElementSplittedByBrakeAndComma = dataArraySplittedByBrake[x].split[","];
    dataElementSplittedByBrakeAndComma.shift();
    dataArraySplittedByBrakeAndComma.push(dataElementSplittedByBrakeAndComma);
  }
  return dataArraySplittedByBrakeAndComma
}


/*
* select data that is around the current position of the device from the array
*@param dataArray: array which contains data of the air quality
*@return: array with relevant air quality data in format: [[timestamp, record, lat, lon, AirTC_Avg, RH_Avg, pm25, pm10], ...]
*/
function selectData(dataArray){
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

      relevantDataArray.push(dataArray[x]);
    }
}
return relevantDataArray;
}


/*
* visualizes data in the AR, writes into html
*@param dataArray: array which contains the RELEVANT data of the air quality in format [[timestamp, record, lat, lon, AirTC_Avg, RH_Avg, pm25, pm10], ...]
*/
function visualizeData(dataArray){
}
