const initCoord = [51.96, 7.63];
const initZoom = 12;

const stationGeist = [51.936482, 7.611609];
const stationWeseler = [51.953275, 7.619379];

// using d3 for convenience
var main = d3.select("main");
var scrolly = main.select("#scrolly");
var figure = scrolly.select("figure");
var map = scrolly.select("#map");
var article = scrolly.select("article");
var step = article.selectAll(".step");

// parsing functions
// var parseDateLANUV = d3.timeParse("%d.%m.%Y"); // 01.12.2019
var parseTimeLANUV = d3.timeParse("%d.%m.%Y-%H:%M"); // 01.12.2019-09:12
var parseTimeSensebox = d3.timeParse("%Y-%m-%d-%H:%M:%S,%L"); // "2019-11-14-14:26:02,456"
var parseTimeBike = d3.timeParse("%Y-%m-%d%_H:%M:%S"); // 2019-11-14 14:35:00

// colour scale for pm10
var colourPM10 = d3
	.scaleSequential()
	.domain([65, 0]) // roughly the range of pm10 values
	.interpolator(d3.interpolateRdBu);

// initialize the scrollama
var scroller = scrollama();

// initialize the Leaflet map
var mymap = L.map("map", {
	// uncomment to disable all zoom controls
	// zoomControl: false,
	// scrollWheelZoom: false,
	// doubleClickZoom: false,
	// touchZoom: false,
	// boxZoom: false,
	// dragging: false
}).setView([51.97, 7.63], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	attribution:
		'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

// start scrolly
initScrolly();

mymap.invalidateSize();

// DATA
d3.csv("data/LANUV_1oct-20nov.csv", function(d) {
	return {
		// date: (d.Datum),
		time: parseTimeLANUV(d.Datum + "-" + d.Zeit),
		pm10_Weseler: +d.Weseler,
		pm10_Geist: +d.Geist
	};
}).then(function(data) {
	console.log("LANUV data: ", data);

	d3.csv("data/Sensebox_Geist_14-11-19.csv", function(d) {
		return {
			humidity: +d.Humidity,
			pm10: +d.P10,
			p2_5: +d["P2.5"],
			pressure: +d.Pressure,
			temp: +d.Temperature,
			time: parseTimeSensebox("2019-11-14-" + d["time of day"])
			// skip "time since power on"​​​​
		};
	}).then(function(data) {
		console.log("Sensebox: ", data);

		d3.csv("data/bike_14-11.csv", function(d) {
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
		}).then(function(bikeData) {
			console.log("Bike: ", bikeData);

			bikeData.forEach(function(d) {
				L.circleMarker([d.lat, d.lon], {
					stroke: false,
					fill: true,
					fillColor: colourPM10(d.pm10),
					fillOpacity: 0.7,
					radius: 8
				}).addTo(mymap);
			});
		});
	});
});

// SCROLLAMA FUNCTIONS

// generic window resize listener event
function handleResize() {
	// 1. update height of step elements
	var stepH = Math.floor(window.innerHeight * 0.75);
	step.style("height", stepH + "px");

	var mapMarginTB = 10;
	var mapHeight = window.innerHeight - mapMarginTB * 2;

	figure.style("height", mapHeight + "px").style("top", mapMarginTB + "px");
	map.style("height", mapHeight + "px");

	// 3. tell scrollama to update new element dimensions
	scroller.resize();
}

// scrollama event handlers
function handleStepEnter(response) {
	console.log(response);
	// response = { element, direction, index }

	// add color to current step only
	step.classed("is-active", function(d, i) {
		return i === response.index;
	});

	// update map based on step
	updateMap(response.index);
	figure.select("p").text(response.index);
}

function setupStickyfill() {
	d3.selectAll(".sticky").each(function() {
		Stickyfill.add(this);
	});
}

function initScrolly() {
	setupStickyfill();

	// 1. force a resize on load to ensure proper dimensions are sent to scrollama
	handleResize();

	// 2. setup the scroller passing options
	// 		this will also initialize trigger observations
	// 3. bind scrollama event handlers (this can be chained like below)
	scroller
		.setup({
			step: "#scrolly article .step",
			offset: 0.33,
			debug: true
		})
		.onStepEnter(handleStepEnter);

	// setup resize event
	window.addEventListener("resize", handleResize);
}

// MAP FUNCTIONS

function updateMap(index) {
	switch (index) {
		case 0:
			break;
		case 1:
			window.markerG = L.marker(stationGeist).addTo(mymap);
			markerG.bindPopup("Air Quality Station <br> <b>Geist</b>").openPopup();
			break;
		case 2:
			window.markerW = L.marker(stationWeseler).addTo(mymap);
			markerW
				.bindPopup("Air Quality Station <br> <b>Weseler Straße</b>")
				.openPopup();
			break;
	}
}
