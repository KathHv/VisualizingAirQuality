/**
*
*@var
*/
var linearGauge;

/**
*
*@param
*@param
*@param
*@param
*@param
*/
function translateRange(Input , inputHigh , inputLow , outputHigh , OutputLow) {

	inputHigh = inputHigh ? inputHigh : (this.inputHigh ? this.inputHigh : 65);
	inputLow = inputLow ? inputLow : (this.inputLow ? this.inputLow : 0);

	outputHigh =  outputHigh ? outputHigh : 1;
	OutputLow = OutputLow ? OutputLow : 0;

	return ((Input - inputLow) / (inputHigh - inputLow)) *
		(outputHigh - OutputLow) + OutputLow;
}

/**
*
*@param
*/
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
	};

	/**
	*
	*/
	HyyanAF.LinearGauge.prototype = {

		constructor: HyyanAF.LinearGauge,

		translateRange: translateRange,

		draw: function(min, max){

			// setup drawing context
			var ctx = this.canvas.getContext("2d");
			//clear before redrawing
			ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

			// defines the fill style on canvas
			ctx.fillStyle = '#3a3a3a';

			// draw the a rect filled with created gradient
			ctx.fillRect(this.canvasWidth/4, 0, this.canvasWidth/2, this.canvasHeight);

			this.drawMinMax(min, max);

			return this;
		},

		drawMinMax: function(min, max) {
			var ctx = this.canvas.getContext("2d");
			ctx.font = "bold 8px Arial";
			ctx.fillStyle = "white";
			ctx.fillText(max,this.canvasWidth/2,8);
			ctx.fillText(min,this.canvasWidth/2,this.canvasHeight-4);
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
			ctx.arc(this.x, this.canvasHeight - y, this.w, 0, 2 * Math.PI, false);
			ctx.fill();

			ctx.font = '8pt Calibri';
			ctx.fillStyle = 'black';
			ctx.textAlign = 'center';
			ctx.fillText(content, this.x, this.canvasHeight - y + 3);

			return this;

		},
		drawStep:  function(value, color, width){

			// setup drawing context
			var ctx = this.canvas.getContext("2d");

			width = width ? width : 10;
			ctx.strokeStyle = color ? color : '#000';
			ctx.lineWidth = 2;

			// draw line indicate a value
			ctx.beginPath();
			ctx.moveTo(
				this.canvasWidth/2 - width/2,
				this.canvasHeight -
				this.translateRange(
					value,
					this.inputHigh,
					this.inputLow,
					this.canvasHeight,
					0
				)
			);
			ctx.lineTo(
				this.canvasWidth/2 + width/2,
				this.canvasHeight -
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

/**
*@var
*/
linearGauge = new HyyanAF.LinearGauge(gauge,0, 65)
	.draw("0", "65")
	.drawStep(10, "#d9d9d9", 5)
	.drawStep(20, "#d9d9d9", 5)
	.drawStep(30, "#d9d9d9", 5)
	.drawStep(40, "#d9d9d9", 5)
	.drawStep(50, "#d9d9d9", 5)
	.drawStep(60, "#d9d9d9", 5)
	.drawPointer(35, "#ffdb4d", "35")
	.drawPointer(15, "#b38e00", "15");
