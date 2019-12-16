    //<a-entity gltf-model="./magnemite/scene.gltf" rotation="0 180 0" scale="0.15 0.15 0.15" gps-entity-place="longitude: 7.634489; latitude: 51.956722;" animation-mixer/>

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


//getLocation
//getLocationOfClosestRoutePoint
//getPM10ValueOfClosestRoutePoint
function getPM10(closest){
  var pm10 = closest.air_quality.pm10;
}

//visualizeValue
  // set All paricles unvisible
  //paricle1
  //particle2
  //particle3
  //particle4
   var particleObject = [particle1, particle2, particle3, particle4];
   var pos = [x, y, z, ]
   var particlePosition = []
  //
  //14.11: min 1.185, max 62.529 -> per microgramm 1 particle
  //Area of


  /*
  * visualizes data in the AR, writes into html
  *@param dataArray: array which contains the RELEVANT data of the air quality in format [[timestamp, record, lat, lon, AirTC_Avg, RH_Avg, pm25, pm10], ...]
  */
  function visualizeParticles(dataArray){
      JL("mylogger").info("--------visualizeParticles()--------");
      let scene = document.querySelector('a-scene');

      dataArray.forEach((particle) => {
          let particlePos = particle.position.x + " " + particle.position.y + " " + particle.position.z;
          let particleRot = particle.rotation.x + " " + particle.rotation.y + " " + particle.rotation.z;

          // add particle icon
          let icon = document.createElement('a-entity');
          icon.setAttribute('height', '0.1');
          icon.setAttribute('name', particle.id);
          icon.setAttribute('position', particlePos);
          icon.setAttribute('rotation', particleRot);

          // for debug purposes, just show in a bigger scale, otherwise I have to personally go on places...
          icon.setAttribute('scale', '5 5 5');

          //icon.addEventListener('loaded', () => window.dispatchEvent(new CustomEvent('gps-entity-place-loaded')));
          scene.appendChild(icon);
          //<a-entity rotation="213 123.00000000000001 123.00000000000001" id="123" position="-0.27483 2.68898 1" visible="" arrow=""></a-entity>
      });

       
  }
