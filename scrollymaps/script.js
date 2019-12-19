const initCoord = [51.96, 7.63];
const initZoom = 12;

const stationGeist = [51.936482, 7.611609]; // lat lon
const stationWeseler = [51.953275, 7.619379];

const scrollyImg = ["lanuv.jpg", "sensebox.jpg", "bike.jpg"];

// parsing functions
// var parseDateLANUV = d3.timeParse("%d.%m.%Y"); // 01.12.2019
var parseTimeLANUV = d3.timeParse("%d.%m.%Y-%H:%M"); // 01.12.2019-09:12
var parseTimeSensebox = d3.timeParse("%Y-%m-%d-%H:%M:%S,%L"); // "2019-11-14-14:26:02,456"
var parseTimeBike = d3.timeParse("%Y-%m-%d%_H:%M:%S"); // 2019-11-14 14:35:00
var formatTime = d3.timeFormat("%d/%m/%Y, %H:%M");
var formatTimeHour = d3.timeFormat("%d%m%Y%H");

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
var timerB = {
	div: d3.select("#timeB"),
	start: new Date(2019, 10, 14),
	end: new Date(2019, 10, 14, 23, 59, 59),
	speedFactor: 24 * 60
};

timerB.scale = d3
	.scaleTime()
	.range([timerB.start, timerB.end])
	.domain([0, (timerB.end - timerB.start) / timerB.speedFactor]);

var scrollyC = {
	scrolly: d3.select("#scrollyC"),
	step: d3.select("#scrollyC").selectAll(".step")
};

// var figure = scrolly.select("figure");
// var map = scrolly.select("#map");
// var article = scrolly.select("article");
// var step = article.selectAll(".step");

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

// initialize two Leaflet maps B and C
var mapB = L.map("mapB", {
	// disable all zoom controls that interfere with scrolling
	// zoomControl: false,
	scrollWheelZoom: false,
	doubleClickZoom: false,
	touchZoom: false
	// boxZoom: false
	// dragging: false
}).setView([51.97, 7.63], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	attribution:
		'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mapB);

// SVG overlay for mapB
L.svg().addTo(mapB);
const overlayB = d3.select(mapB.getPanes().overlayPane);
const svgB = overlayB.select("svg");

var mapC = L.map("mapC", {
	// disable all zoom controls that interfere with scrolling
	// zoomControl: false,
	scrollWheelZoom: false,
	doubleClickZoom: false,
	touchZoom: false
	// boxZoom: false
	// dragging: false
}).setView([51.97, 7.63], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	attribution:
		'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mapC);

mapB.invalidateSize();
mapC.invalidateSize();

// DATA
Promise.all([
	d3.csv("data/lanuv_14Nov_modified.csv", function(d) {
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

		var data1 = { lanuv: data[0], sensebox: data[1], bike: data[2] };

		// start scrolly
		initScrollyA(data1);
		initScrollyB(data1);
		initScrollyC(data1);

		// bikeData.forEach(function(d) {
		// 	L.circleMarker([d.lat, d.lon], {
		// 		stroke: false,
		// 		fill: true,
		// 		fillColor: colourPM10(d.pm10),
		// 		fillOpacity: 0.7,
		// 		radius: 8
		// 	}).addTo(mapC);
		// });
	})
	.catch(function(err) {
		if (err) throw err;
	});

// SCROLLAMA FUNCTIONS

// generic window resize listener event
function handleResize() {
	// 1. update height of step elements
	var stepH = Math.floor(window.innerHeight * 0.75);
	allSteps.style("height", stepH + "px");
	var figureHeight = window.innerHeight * 0.75;
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

function initScrollyA(data) {
	setupStickyfill();

	scrollerA
		.setup({
			step: "#scrollyA article .step",
			offset: 0.33,
			debug: true
		})
		.onStepEnter(function(r) {
			handleStepEnterA(r, data);
		});
}

// scrollama event handlers
function handleStepEnterA(response, data) {
	// response = { element, direction, index }

	// add color to current step only
	scrollyA.step.classed("is-active", function(d, i) {
		return i === response.index;
	});

	// update image based on step
	scrollyA.img.attr("src", "img/" + scrollyImg[response.index]);
	// update map based on step
	// updateMap(response.index);
	// figure.select("p").text(response.index);
}

////////////////////////////////////////////////////////////////////////////////
// SCROLLY B ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function initScrollyB(data) {
	setupStickyfill();

	scrollerB
		.setup({
			step: "#scrollyB article .step",
			offset: 0.33,
			debug: true
		})
		.onStepEnter(r => handleStepEnterB(r, data));
}

// scrollama event handlers
function handleStepEnterB(response, data) {
	console.log("ScrollyB:", response.index, data);
	// response = { element, direction, index }

	// add color to current step only
	scrollyB.step.classed("is-active", function(d, i) {
		return i === response.index;
	});

	switch (response.index) {
		case 0:
			// start timer
			var el1_hour = -1; // to store hour of previous elapsed time
			var t = d3.timer(timer, 150);
			function timer(elapsed) {
				var el = timerB.scale(elapsed);
				// console.log(elapsed);
				timerB.div.html(formatTime(el));
				// check if new hour has started, only do stuff if yes
				if (el.getHours() != el1_hour) {
					var datanow = data.lanuv.find(function(d) {
						return formatTimeHour(d.time) === formatTimeHour(el);
					});
					d3.select("#ptGeist").attr("fill", function() {
						return colourPM10(datanow.pm10_Geist);
					});
					d3.select("#ptWeseler").attr("fill", function() {
						return colourPM10(datanow.pm10_Weseler);
					});
				}

				// update elapsed time
				el1_hour = el.getHours();
				// make timer loop through one day
				if (timerB.scale(elapsed) > timerB.end) t.restart(timer);
			}

			// bike route

			//  test dot
			svgB
				.selectAll("circle")
				.data([stationGeist, stationWeseler])
				.enter()
				.append("circle")
				.attr("id", (d, i) => ["ptGeist", "ptWeseler"][i])
				// .attr("fill", ) --> set in timer
				.attr("cx", d => mapB.latLngToLayerPoint(d).x)
				.attr("cy", d => mapB.latLngToLayerPoint(d).y)
				.attr("r", 15);

			break;
		case 1:
			// window.markerG = L.marker(stationGeist).addTo(mymap);
			// markerG.bindPopup("Air Quality Station <br> <b>Geist</b>").openPopup();
			break;
	}

	if (response.index == 0) {
	}

	// update map based on step
	// updateMap(response.index);
	// figure.select("p").text(response.index);
}

////////////////////////////////////////////////////////////////////////////////
// SCROLLY C ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function initScrollyC(data) {
	setupStickyfill();

	scrollerC
		.setup({
			step: "#scrollyC article .step",
			offset: 0.33,
			debug: true
		})
		.onStepEnter(function(r) {
			handleStepEnterC(r, data);
		});
}

// scrollama event handlers
function handleStepEnterC(response, data) {
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
