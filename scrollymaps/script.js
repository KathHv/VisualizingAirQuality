const initCoord = [51.96, 7.63];
const initZoom = 12;

const stationGeist = [51.936482, 7.611609];
const stationWeseler = [51.953275, 7.619379];

var main = d3.select("main");
var allSteps = d3.selectAll(".step");
var allFigures = d3.selectAll("figure");
var scrollyA = {
	scrolly: d3.select("#scrollyA"),
	img: d3.select("#scrollyA img"),
	step: d3.select("#scrollyA").selectAll(".step")
};

var scrollyB = {
	scrolly: d3.select("#scrollyB"),
	step: d3.select("#scrollyB").selectAll(".step")
};
var scrollyC = {
	scrolly: d3.select("#scrollyC"),
	step: d3.select("#scrollyC").selectAll(".step")
};

// var figure = scrolly.select("figure");
// var map = scrolly.select("#map");
// var article = scrolly.select("article");
// var step = article.selectAll(".step");

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
var scrollerA = scrollama();
var scrollerB = scrollama();
var scrollerC = scrollama();

handleResize();

// setup resize event
window.addEventListener("resize", handleResize);

// start scrolly
initScrollyA();
initScrollyB();
initScrollyC();

// DATA
Promise.all([
	d3.csv("data/LANUV_1oct-20nov.csv", function(d) {
		return {
			// date: (d.Datum),
			time: parseTimeLANUV(d.Datum + "-" + d.Zeit),
			pm10_Weseler: +d.Weseler,
			pm10_Geist: +d.Geist
		};
	}),
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
	}),
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
	})
])
	.then(function(data) {
		console.log("LANUV: ", data[0], "senseBox: ", data[1], "Bike:", data[2]);

		var bikeData = data[2];

		bikeData.forEach(function(d) {
			L.circleMarker([d.lat, d.lon], {
				stroke: false,
				fill: true,
				fillColor: colourPM10(d.pm10),
				fillOpacity: 0.7,
				radius: 8
			}).addTo(mymap);
		});
	})
	.catch(function(err) {
		if (err) throw err;
	});

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

mymap.invalidateSize();

// SCROLLAMA FUNCTIONS

// generic window resize listener event
function handleResize() {
	// 1. update height of step elements
	var stepH = Math.floor(window.innerHeight * 0.75);
	allSteps.style("height", stepH + "px");
	var figureHeight = window.innerHeight / 2;
	var figureMarginTop = (window.innerHeight - figureHeight) / 2;
	allFigures
		.style("height", figureHeight + "px")
		.style("top", figureMarginTop + "px");
	// 3. tell scrollama to update new element dimensions
	scrollerA.resize();
	scrollerB.resize();
	scrollerC.resize();
}

////////////////////////////////////////////////////////////////////////////////
// SCROLLY A ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function initScrollyA() {
	setupStickyfill();

	scrollerA
		.setup({
			step: "#scrollyA article .step",
			offset: 0.33,
			debug: true
		})
		.onStepEnter(handleStepEnterA);
}

// scrollama event handlers
function handleStepEnterA(response) {
	console.log(response);
	// response = { element, direction, index }

	// add color to current step only
	scrollyA.step.classed("is-active", function(d, i) {
		return i === response.index;
	});

	// update image based on step
	scrollyA.img.attr("src", "img/test" + (response.index + 1) + ".png");
	// update map based on step
	// updateMap(response.index);
	// figure.select("p").text(response.index);
}

////////////////////////////////////////////////////////////////////////////////
// SCROLLY B ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function initScrollyB() {
	setupStickyfill();

	scrollerB
		.setup({
			step: "#scrollyB article .step",
			offset: 0.33,
			debug: true
		})
		.onStepEnter(handleStepEnterB);
}

// scrollama event handlers
function handleStepEnterB(response) {
	console.log("ScrollyB:", response.index);
	// response = { element, direction, index }

	// add color to current step only
	scrollyB.step.classed("is-active", function(d, i) {
		return i === response.index;
	});

	// update map based on step
	// updateMap(response.index);
	// figure.select("p").text(response.index);
}

////////////////////////////////////////////////////////////////////////////////
// SCROLLY C ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function initScrollyC() {
	setupStickyfill();

	scrollerC
		.setup({
			step: "#scrollyC article .step",
			offset: 0.33,
			debug: true
		})
		.onStepEnter(handleStepEnterC);
}

// scrollama event handlers
function handleStepEnterC(response) {
	console.log("ScrollyC:", response.index);
	// response = { element, direction, index }

	// add color to current step only
	scrollyC.step.classed("is-active", function(d, i) {
		return i === response.index;
	});

	// update map based on step
	// updateMap(response.index);
	// figure.select("p").text(response.index);
}

////////////////////////////////////////////////////////////////////////////////

function setupStickyfill() {
	d3.selectAll(".sticky").each(function() {
		Stickyfill.add(this);
	});
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
