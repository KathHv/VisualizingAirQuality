/*
* @author Katharina Hovestadt
*/

/*
* initialzing variables
*@param url: URL to the csv-file which contains the data
*@param currentPosition: current position of the device [lat,lng]
*@param visArea: area in document where something can be visualized
*/
var url;
var currentPosition;
var visArea = document.getElementById("visArea");


/*
* read Data from csv file
*@return: array with air quality data in format: [[timestamp, lat, lon, AirTC_Avg, RH_Avg, pm25, pm10], ...]
*/
function readData(){
return dataArray;
}


/*
* select data that is around the current position of the device from the array
*@param dataArray: array which contains data of the air quality
*@return: array with air quality data in format: [[timestamp, lat, lon, AirTC_Avg, RH_Avg, pm25, pm10], ...]
*/
function selectData(dataArray){
return dataArray;
}


/*
*
*@param dataArray: array which contains the RELEVANT data of the air quality
*/
function visualizeData(dataArray){
} 
