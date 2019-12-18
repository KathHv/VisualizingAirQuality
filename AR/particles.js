
    /**
     * @author Katharina Hovestadt

    /**
     * initialzing variables
     *@param url: URL to the csv-file which contains the data
     *@param currentPosition: current position of the device [lat,lng]
     *@param visArea: area in document where something can be visualized
     */
    var url = "data/";
    var currentPosition;
    var visArea = document.getElementById("visArea");
    var direction;
    var routeArray = readData("data/bike_14-11.csv");

    JL("mylogger").setOptions({"appenders": [consoleAppender]});


    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                JL("mylogger").info("Latitude: " + position.coords.latitude +
                  ", Longitude: " + position.coords.longitude);
            });
        } else {
            JL("mylogger").info("Geolocation is not supported by this browser.");
        }
    }


    function getDataOfClosestRoutePoint(){
      var lat = current.location.lat;
      var long = current.location.lng;

      distance

    }


function getPM10(){
  
  getLocation();
  closest = getDataOfClosestRoutePoint)();
  var pm10 = closest.air_quality.pm10;
  return pm10;
}

  /*
  * visualizes data in the AR, writes into html
  *@param dataArray: array which contains the RELEVANT data of the air quality in format [[timestamp, record, lat, lon, AirTC_Avg, RH_Avg, pm25, pm10], ...]
  */
  function visualizeParticles(pm10Value){
      JL("mylogger").info("--------visualizeParticles()--------");
      let scene = document.querySelector('#dust');

          // add particle icon
          let dust = document.createElement('a-entity');
          dust.setAttribute('position', '0 2.25 -15')
          pm10ValueVisualized = pm10Value * 10000;
          dust.setAttribute('particle-system', 'preset: dust; particleCount: ' + pm10ValueVisualized+';  color: #61210B, #61380B, #3B170B');
          scene.appendChild(dust);
      });


  }
