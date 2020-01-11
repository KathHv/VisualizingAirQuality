var linearGauge;
(function(HyyanAF) {

	'use strict';

	HyyanAF.LinearGauge = HyyanAF.LinearGauge || {};

	// constructor
	HyyanAF.LinearGauge = function(canvas,inputLow,inputHigh){

		this.canvas = canvas;
		this.inputLow = inputLow;
		this.inputHigh = inputHigh;
		this.canvasWidth = Number(canvas.getAttribute("Width"));
		this.canvasHeight = Number(canvas.getAttribute("height"));
		this.x = this.canvasWidth/2;
		this.w = this.x;
	}

	HyyanAF.LinearGauge.prototype = {

		constructor: HyyanAF.LinearGauge,

		translateRange: function(
			Input , inputHigh , inputLow , outputHigh , OutputLow
		){

			inputHigh = inputHigh ? inputHigh : this.inputHigh;
			inputLow = inputLow ? inputLow : this.inputLow;

			outputHigh =  outputHigh ? outputHigh : 1;
			OutputLow = OutputLow ? OutputLow : 0;

			return ((Input - inputLow) / (inputHigh - inputLow)) *
				(outputHigh - OutputLow) + OutputLow;
		},

		draw: function(stops){

			// setup drawing context
			var ctx = this.canvas.getContext("2d");
			//clear before redrawing
			ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

			// define the gradient
			var gradient = ctx.createLinearGradient(
				0, 0, 0, this.canvasHeight
			);

			// draw stops from an array
			// where every item is an array contains
			// the position and the color of the gradient
			for (var i = 0; i < stops.length; i++) {
				gradient.addColorStop(
					this.translateRange(stops[i][0]),
					stops[i][1]
				);
			}

			// defines the fill style on canvas
			ctx.fillStyle = gradient;

			// draw the a rect filled with created gradient
			ctx.fillRect(this.canvasWidth/4, 0, this.canvasWidth/2, this.canvasHeight);

			return this;
		},

		drawPointer: function(value,color, content){

			var y = this.translateRange(
				value,
				this.inputHigh,
				this.inputLow,
				this.canvasHeight,
				0
			);
			var ctx = this.canvas.getContext("2d");
			ctx.beginPath();
			ctx.fillStyle = color ? color : '#000';
			ctx.arc(this.x, y, this.w, 0, 2 * Math.PI, false);
			ctx.fill();

			ctx.font = '8pt Calibri';
			ctx.fillStyle = 'white';
			ctx.textAlign = 'center';
			ctx.fillText(content, this.x, y+3);

			return this;

		},
		drawPointerLanuv:  function(value,color,width){

			// setup drawing context
			var ctx = this.canvas.getContext("2d");

			width = width ? width : 10;
			ctx.strokeStyle = color ? color : '#000';
			ctx.lineWidth = 3;

			// draw line indicate a value
			ctx.beginPath();
			ctx.moveTo(
				0,
				this.translateRange(
					value,
					this.inputHigh,
					this.inputLow,
					this.canvasHeight,
					0
				)
			);
			ctx.lineTo(
				width,
				this.translateRange(
					value,
					this.inputHigh,
					0,
					this.canvasHeight,
					0
				)
			);

			ctx.stroke();

			return this;
		}
	}
}(window.HyyanAF = window.HyyanAF || {}));

// Init
var gauge = document.getElementById('gauge');
var stops = [
	[0, "#09ef0f"],
	[15, "#f3f31c"],
	[45, "#f3f31c"],
	[65, "#fd070e"]
]
linearGauge = new HyyanAF.LinearGauge(gauge,65,0)
	.draw(stops)
	.drawPointer(30, "#252cef", "30")
	.drawPointerLanuv(13, "#0c0c26", 65);
