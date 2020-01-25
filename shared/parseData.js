// parsing functions
var parseTimeLANUV = d3.timeParse("%d.%m.%Y-%H:%M"); // 01.12.2019-09:12
var parseTimeBike = d3.timeParse("%Y-%m-%d %H:%M:%S"); // 2019-11-14 14:35:00
var parseTimeSensebox = d3.timeParse("%Y-%m-%d-%H:%M:%S,%L"); // 14:26:02,456

function parseLANUV(d) {
	return {
		// date: (d.Datum),
		time: parseTimeLANUV(d.date + "-" + d.time),
		pm10_Weseler: +d.pm10_Weseler,
		pm10_Geist: +d.pm10_Geist
	};
}

function parseSensebox(d, date) {
	// date must be: "2019-12-19-" or "2019-11-14-"
	return {
		//humidity: +d.Humidity,
		pm10: +d.pm10,
		p2_5: +d.pm25,
		pressure: +d.Pressure,
		// temp: +d.Temperature,
		time: parseTimeSensebox(date + d.time)
		// skip "time since power on"​​​​
	};
}

// time_since_power_on, time, pm25, pm10, AirTC_Avg, RH_Avg, Pressure;

function parseBike(d) {
	return {
		time: parseTimeBike(d.time),
		lat: +d.lat,
		lon: +d.lon,
		pm10: +d.pm10,
		pm2_5: +d.pm25
		// skip:
		// AirTC_Avg: "8.12"
		// RECORD: "36625"
		// RH_Avg: "67.14"
	};
}

function parseGuide(d) {
	return {
		name: d.name,
		lat: +d.lat,
		lon: +d.lon,
		text: d.text,
		color: d.color
	};
}
