var bike1411;
var bike1911;
var sensebox1411;
var sensebox1911;
var lanuv1411;
var lanuv1911;



// parsing functions
var parseTimeLANUV = d3.timeParse("%d.%m.%Y-%H:%M"); // 01.12.2019-09:12
var parseTimeBike = d3.timeParse("%Y-%m-%d%_H:%M:%S"); // 2019-11-14 14:35:00

function readAllData(){
  // DATA
  Promise.all([
  	d3.csv("../data/lanuv_14Nov_modified.csv", function(d) {
  		return {
  			// date: (d.Datum),
  			time: parseTimeLANUV(d.date + "-" + d.time),
  			pm10_Weseler: +d.pm10_Weseler,
  			pm10_Geist: +d.pm10_Geist
  		};
  	}),
  	d3.csv("../data/Sensebox_Geist_14-11-19.csv", function(d) {
  		return {
  			humidity: +d.Humidity,
  			pm10: +d.P10,
  			p2_5: +d["P2.5"],
  			pressure: +d.Pressure,
  			temp: +d.Temperature,
  			time: +d.time
  			// skip "time since power on"​​​​
  		};
  	}),
  	d3.csv("../data/bike_14-11.csv", function(d) {
  		return {
  			time: parseTimeBike(d.TIMESTAMP),
  			lat: +d.lat,
  			lon: +d.lon,
  			pm10: +d.pm10,
  			pm2_5: +d.pm25
  			// skip:
  			// AirTC_Avg: "8.12"
  			// RECORD: "36625"
  			// RH_Avg: "67.14"
  		};
      d3.csv("../data/lanuv_19Dec_modified.csv", function(d) {
        return {
          // date: (d.Datum),
          time: parseTimeLANUV(d.date + "-" + d.time),
          pm10_Weseler: +d.pm10_Weseler,
          pm10_Geist: +d.pm10_Geist
        };
      }),
      d3.csv("../data/Sensebox_Geist_19-12-19.csv", function(d) {
        return {
          humidity: +d.RH_Avg,
          pm10: +d.pm10,
          p2_5: +d.pm25,
          pressure: +d.Pressure,
          temp: +d.AirTC_Avg,
          time: +d.time
          // skip "time since power on"​​​​
        };
      }),
      d3.csv("../data/bike_19-12.csv", function(d) {
        return {
          time: parseTimeBike(d.TIMESTAMP),
          lat: +d.lat,
          lon: +d.lon,
          pm10: +d.pm10,
          pm2_5: +d.pm25
          // skip:
          // AirTC_Avg: "8.12"
          // RECORD: "36625"
          // RH_Avg: "67.14"
        };
  	})
  ])
  	.then(function(data) {
      bike1411 = data[2];
      bike1911 = data[5];
      sensebox1411 = data[1];
      sensebox1911 = data[4];
      lanuv1411 = data[0];
      lanuv1911 = data[3];

  		console.log("14.11.2019: LANUV: ", data[0], "senseBox: ", data[1], "Bike:", data[2], "/r/n  19.12.2019: LANUV: ", data[3], "senseBox: ", data[4], "Bike:", data[5]);


  	})
  	.catch(function(err) {
  		if (err) throw err;
  	});
}
