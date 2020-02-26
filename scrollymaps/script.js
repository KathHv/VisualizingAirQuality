var stationGeist = [51.936482, 7.611609]; // lat lon
var stationWeseler = [51.953275, 7.619379];

var boundsMuensterSmall = [[51.965114, 7.601657], [51.928291, 7.628437]];
var boundsMuenster = [[51.982262, 7.590976], [51.927088, 7.679865]];

var scrollyImg = ["lanuv.jpg", "sensebox.jpg", "bike.jpg", "all.png"];
var mapInteractions = {
	// disable all zoom controls that interfere with scrolling
	keyboard: false,
	dragging: false,
	zoomControl: false,
	boxZoom: false,
	doubleClickZoom: false,
	scrollWheelZoom: false,
	tap: false,
	touchZoom: false
};

// time formatters
var formatTime = d3.timeFormat("%d/%m/%Y, %H:%M");
var formatTimeHour = d3.timeFormat("%d%m%Y%H");

var t1, t2;

var main = d3.select("main");
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

var timerLong = d3
	.scaleTime()
	.range([new Date(2019, 10, 14), new Date(2019, 10, 14, 23, 59, 59)])
	.domain([0, 1]);

var timerShort = d3
	.scaleTime()
	.range([new Date(2019, 10, 14, 14, 25, 0), new Date(2019, 10, 14, 16, 3, 0)])
	.domain([0, 1]);

var scrollyC = {
	scrolly: d3.select("#scrollyC"),
	step: d3.select("#scrollyC").selectAll(".step")
};

// colour scale for pm10
var pmBounds = [0, 40]; // roughly the range of pm10 values
var colourPM10 = d3
	.scaleSequentialSqrt()
	.domain([pmBounds[1], pmBounds[0]]) // flip because we want red to be highest
	.interpolator(d3.interpolateRdBu);

// opacity scale for fading in and out bike dots
var opacityScale = d3
	.scaleLinear()
	.domain([120000, 0]) // 2 minutes are 120000 ms
	.range([0, 1]);

// legend on scrolly B
// based on: https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient.html
var legendSVG = d3
	.select("#legendB")
	.append("svg")
	.attr("width", 100)
	.attr("height", 300);

var legend = legendSVG.append("g").attr("transform", "translate(65,10)");

// Create linear gradient
var defs = legendSVG.append("defs");
var linearGradient = defs
	.append("linearGradient")
	.attr("id", "linear-gradient");
linearGradient
	.attr("x1", "0%")
	.attr("y1", "0%")
	.attr("x2", "0%")
	.attr("y2", "100%");

var colourPct = d3.zip(
	d3.range(0, 101, 10).map(d => Math.round(d) + "%"),
	d3.schemeRdBu[11]
);
console.log(colourPct);

colourPct.forEach(function(d) {
	linearGradient
		.append("stop")
		.attr("offset", d[0])
		.attr("stop-color", d[1]);
});

// Rectangle w/ gradient
legend
	.append("rect")
	.attr("width", 25)
	.attr("height", 280)
	.style("fill", "url(#linear-gradient)");

// labels
legend
	.selectAll("text")
	.data([[280, pmBounds[0] + "ppm -"], [0, ">" + pmBounds[1] + "ppm -"]])
	.enter()
	.append("text")
	.classed("legendLabel", true)
	.attr("x", 0)
	.attr("y", d => d[0])
	.text(d => d[1]);

// initialize the scrollama
var scrollerA = scrollama();
var scrollerB = scrollama();
var scrollerC = scrollama();

handleResize();

// setup resize event
window.addEventListener("resize", handleResize);

// initialise Leaflet map for scrolly B
var mapB = L.map("mapB", mapInteractions).setView([51.97, 7.63], 13);
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
	attribution:
		'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(mapB);

// SVG overlay for mapB
L.svg().addTo(mapB);
var overlayB = d3.select(mapB.getPanes().overlayPane);
var svgB = overlayB.select("svg");
var gBikePath = svgB
	.append("g")
	.attr("id", "gBikePath")
	.classed("hidden", true);
var gBikeDots = svgB
	.append("g")
	.attr("id", "gBikeDots")
	.classed("hidden", true);
var gStationDots = svgB
	.append("g")
	.attr("id", "gStationDots")
	.classed("hidden", true);
var gSenseBox = svgB
	.append("g")
	.attr("id", "gSenseBox")
	.classed("hidden", true);

mapB.invalidateSize();

mapB.fitBounds(boundsMuensterSmall);

//////////////////////////////////////////////////////////////
/// map C
//////////////////////////////////////////////////////////////

var mapC = L.map("mapC", mapInteractions);

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
	attribution:
		'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(mapC);

// create elements
// add interpolation
var imageURL = "data/idw_14-11_large.png";
var imageBounds = [[51.93095, 7.58095], [51.96405, 7.65905]];

var interpolation = L.imageOverlay(imageURL, imageBounds, { opacity: 0.7 });

var legendC = legendB.cloneNode(true);
var divLegendC = document.getElementById("legendC");
divLegendC.append(legendC);
divLegendC.style.display = "none";
//
//// add init coord
var minExtent = [[51.93095, 7.60295], [51.96405, 7.62205]];
//var initLat = minExtent[0][0] + ((minExtent[1][0]-minExtent[0][0])/2);
//var initLon = minExtent[0][1] + ((minExtent[1][1]-minExtent[0][1])/2);
//var initCoord = [initLat,initLon];
//var initZoom = 14;
//
// add stations
var stationOptions = {
	color: "#759f9e",
	fillColor: "#8ebfbe",
	fillOpacity: 0.5,
	radius: 10
};
var geist = L.circleMarker(stationGeist, stationOptions);
var weseler = L.circleMarker(stationWeseler, stationOptions);

// add POI
var poiPos = [[51.957, 7.609], [51.959, 7.611]];
var poiURL = "img/stickman.png";
var poi = L.imageOverlay(poiURL, poiPos);
/*
var poi = L.circleMarker(poiPos, {
	fillColor: "#3d3d3d",
	color: "#636363"
});
*/

// add line
var linePos = [[51.9636, 7.5246], [51.928, 7.6963]];
var line = L.polyline(linePos, {
	color: "#759f9e"
});

// add color
var bBoxN = [linePos[0], linePos[1], [52, 7.7], [52, 7.5]];
var bBoxS = [linePos[0], linePos[1], [51.9, 7.7], [51.9, 7.5]];

var backgroundN = L.polygon(bBoxN, {
	fillColor: "#759f9e",
	opacity: 0.1
});
var backgroundS = L.polygon(bBoxS, {
	fillColor: "#f7f7f7",
	opacity: 0.1
});

// question mark
var questionUrl = "img/question-mark.png";
var questionBBox = [[51.958, 7.606], [51.962, 7.601]];
var qm = L.imageOverlay(questionUrl, questionBBox, {
	opacity: 1,
	zindex: 100
});

// create layergroups
var group1 = L.layerGroup([geist, weseler, poi]);
var group2 = L.layerGroup([backgroundN, backgroundS, line]);
// end creating elements for mapC

mapC.fitBounds(minExtent);
mapC.invalidateSize();

//////////
// DATA
//////////
Promise.all([
	d3.csv("data/lanuv_14Nov_modified.csv", parseLANUV),
	d3.csv("data/Sensebox_Geist_14-11-19.csv", function(d) {
		return parseSensebox(d, "2019-11-14-");
	}),
	d3.csv("data/bike_14-11.csv", parseBike)

	// not using the 19 Dec data currently
	// d3.csv("data/lanuv_19Dec_modified.csv", parseLANUV),
	// d3.csv("data/Sensebox_Geist_19-12-19.csv", parseSensebox),
	// d3.csv("data/bike_19-12.csv", parseBike)
])
	.then(function(data) {
		console.log("LANUV: ", data[0], "senseBox: ", data[1], "Bike:", data[2]);

		var data1 = { lanuv: data[0], sensebox: data[1], bike: data[2] };

		// start scrolly
		initScrollyA(data1);
		initScrollyB(data1);
		initScrollyC(data1);
	})
	.catch(function(err) {
		if (err) throw err;
	});

// SCROLLAMA FUNCTIONS

// generic window resize listener event
function handleResize() {
	// 1. update height of step elements
	var stepH = Math.floor(window.innerHeight * 0.75);
	// scrollyA.step.style("height", stepH + "px");
	// scrollyB.step.style("height", stepH + "px");
	// scrollyC.step.style("height", stepH + "px");

	d3.selectAll(".step.height1").style("height", stepH + "px");
	d3.selectAll(".step.height2").style("height", 2 * stepH + "px");
	d3.selectAll(".step.height3").style("height", 3 * stepH + "px");

	var figureHeight = window.innerHeight * 0.95;
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
			debug: false
		})
		.onStepEnter(function(r) {
			handleStepEnterA(r, data);
		});
}

// scrollama event handlers
function handleStepEnterA(response, data) {
	// add color to current step only
	scrollyA.step.classed("is-active", function(d, i) {
		return i === response.index;
	});

	// update image based on step
	scrollyA.img.attr("src", "img/" + scrollyImg[response.index]);
}

////////////////////////////////////////////////////////////////////////////////
// SCROLLY B ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function initScrollyB(data) {
	// set up scroller
	scrollerB
		.setup({
			step: "#scrollyB article .step",
			progress: true,
			offset: 0.5,
			debug: false
		})
		.onStepEnter(handleStepEnterB)
		.onStepExit(handleStepExitB)
		.onStepProgress(r => handleStepProgressB(r, data));

	// draw all visualisations into g elements
	// we will not draw anything new while scrolling, only show/hide things
	// which hopefully makes this run more smoothly than it would otherwise

	//  dots for stations
	gStationDots
		.selectAll("circle")
		.data([stationGeist, stationWeseler])
		.enter()
		.append("circle")
		.attr("id", (d, i) => ["ptGeist", "ptWeseler"][i])
		// .attr("fill", ) --> set in timer
		.attr("cx", d => mapB.latLngToLayerPoint(d).x)
		.attr("cy", d => mapB.latLngToLayerPoint(d).y)
		.attr("r", 15);

	// bike route
	var lineGenerator = d3
		.line()
		.x(d => mapB.latLngToLayerPoint([d.lat, d.lon]).x)
		.y(d => mapB.latLngToLayerPoint([d.lat, d.lon]).y);
	var bikeRoute = lineGenerator(data.bike);
	gBikePath
		.append("path")
		.attr("d", bikeRoute)
		.attr("id", "bikeRoute");

	// add dot for senseBox data
	gSenseBox
		.append("circle")
		.attr("id", "ptSBGeist")
		.attr("class", "senseboxDots")
		.attr("fill", "#fff") // --> set in timer
		.attr("cx", d => mapB.latLngToLayerPoint(stationGeist).x)
		.attr("cy", d => mapB.latLngToLayerPoint(stationGeist).y)
		.attr("r", 10);

	// add bike dots
	var dotScale = d3
		.scaleSqrt()
		.domain(pmBounds)
		.range([0, 10]);

	gBikeDots
		.selectAll(".bikeDot")
		.data(data.bike)
		.enter()
		.append("circle")
		.attr("class", "bikeDot")
		.attr("cx", d => mapB.latLngToLayerPoint([d.lat, d.lon]).x)
		.attr("cy", d => mapB.latLngToLayerPoint([d.lat, d.lon]).y)
		.attr("r", d => dotScale(d.pm10))
		.attr("fill", d => colourPM10(d.pm10));
}

function handleStepEnterB(response) {
	d3.select(response.element).classed("is-active", true);

	switch (response.index) {
		case 0:
			gStationDots.classed("hidden", false);
			gBikePath.classed("hidden", true);
			gSenseBox.classed("hidden", true);
			gBikeDots.classed("hidden", true);
			break;
		case 1:
			gStationDots.classed("hidden", false);
			gBikePath.classed("hidden", false);
			gSenseBox.classed("hidden", true);
			gBikeDots.classed("hidden", true);
			break;
		case 2:
			gStationDots.classed("hidden", false);
			gBikePath.classed("hidden", false);
			gSenseBox.classed("hidden", false);
			gBikeDots.classed("hidden", true);
			break;
		case 3:
			gStationDots.classed("hidden", false);
			gBikePath.classed("hidden", false);
			gSenseBox.classed("hidden", false);
			gBikeDots.classed("hidden", false);
			break;
	}
}

function handleStepExitB(response) {
	d3.select(response.element).classed("is-active", false);

	// hide station dots when scrolling out to the top
	if ((response.index === 0) & (response.direction === "up")) {
		gStationDots.classed("hidden", true);
	}
}

function handleStepProgressB(response, data) {
	var el = d3.select(response.element);
	var timenow;

	console.log(response.index);

	switch (response.index) {
		case 0:
			timeB.style.display = "block";
			timenow = timerLong(response.progress);
			updateStationDots(timenow, data);
			break;
		case 1:
			// only showing the static bike route here
			timeB.style.display = "none";
			break;
		case 2:
			timeB.style.display = "block";
			timenow = timerShort(response.progress);
			updateStationDots(timenow, data);
			updateSenseboxDots(timenow, data);
			break;
		case 3:
			timeB.style.display = "block";
			timenow = timerShort(response.progress);
			updateStationDots(timenow, data);
			updateSenseboxDots(timenow, data);
			updateBikeDots(timenow);
			break;
	}

	d3.select("#timeB p").html(
		// d3.format(".1%")(response.progress) + "<br/>" +
		formatTime(timenow)
	);
}

function updateStationDots(timenow, data) {
	// get data for the current hour and colour dots
	var datanow = data.lanuv.find(function(d) {
		return formatTimeHour(d.time) === formatTimeHour(timenow);
	});

	d3.select("#ptGeist").attr("fill", function() {
		return colourPM10(datanow.pm10_Geist);
	});
	d3.select("#ptWeseler").attr("fill", function() {
		return colourPM10(datanow.pm10_Weseler);
	});
}

function updateSenseboxDots(timenow, data) {
	var datanow = data.sensebox.find(function(d) {
		return +d.time > +timenow;
	});
	d3.select("#ptSBGeist").attr("fill", function() {
		return typeof datanow === "undefined"
			? "transparent"
			: colourPM10(datanow.pm10);
	});
}

function updateBikeDots(timenow) {
	// check if the dots are there (step 4)
	if (!gBikeDots.selectAll("circle").empty()) {
		console.log("update bike dots op");
		gBikeDots
			.selectAll("circle")
			.attr("opacity", d => opacityScale(Math.abs(+d.time - +timenow)));
	}
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
			debug: false
		})
		.onStepEnter(function(r) {
			handleStepEnterC(r, data);
		});
}

// scrollama event handlers
function handleStepEnterC(response, data) {
	// response = { element, direction, index }

	// add color to current step only
	scrollyC.step.classed("is-active", function(d, i) {
		return i === response.index;
	});

	mapC.fitBounds(minExtent);

	// add or remove element of map depending on the textbox at the left
	switch (response.index) {
		case 0:
			mapC.removeLayer(group2);
			mapC.removeLayer(interpolation);
			divLegendC.style.display = "none";
			group1.addTo(mapC);
			break;
		case 1:
			mapC.removeLayer(interpolation);
			mapC.removeLayer(qm);
			divLegendC.style.display = "none";
			group2.addTo(mapC);
			group1.addTo(mapC);
			break;
		case 2:
			mapC.removeLayer(group2);
			mapC.removeLayer(qm);
			interpolation.addTo(mapC);
			divLegendC.style.display = "block";
			group1.addTo(mapC);
			break;
		case 3:
			mapC.removeLayer(interpolation);
			divLegendC.style.display = "none";
			mapC.removeLayer(group2);
			group1.addTo(mapC);
			qm.addTo(mapC);
			break;
	}
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
