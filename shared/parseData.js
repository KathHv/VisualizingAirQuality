// parsing functions
var parseTimeLANUV = d3.timeParse("%d.%m.%Y-%H:%M"); // 01.12.2019-09:12
var parseTimeBike = d3.timeParse("%Y-%m-%d%_H:%M:%S"); // 2019-11-14 14:35:00

function parseLANUV(d) {
	return {
		// date: (d.Datum),
		time: parseTimeLANUV(d.date + "-" + d.time),
		pm10_Weseler: +d.pm10_Weseler,
		pm10_Geist: +d.pm10_Geist
	};
}

function parseSensebox(d) {
	return {
		humidity: +d.Humidity,
		pm10: +d.P10,
		p2_5: +d["P2.5"],
		pressure: +d.Pressure,
		temp: +d.Temperature,
		time: +d.time
		// skip "time since power on"​​​​
	};
}

function parseBike(d) {
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
}
