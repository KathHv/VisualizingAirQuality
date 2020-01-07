var bike1411;
var bike1911;
var sensebox1411;
var sensebox1911;
var lanuv1411;
var lanuv1911;

function readAllData() {
	// DATA
	Promise.all([
		d3.csv("../data/lanuv_14Nov_modified.csv", parseLANUV),
		d3.csv("../data/Sensebox_Geist_14-11-19.csv", function(d) {
			return parseSensebox(d, "2019-11-14-");
		}),
		d3.csv("../data/bike_14-11.csv", parseBike),
		d3.csv("../data/lanuv_19Dec_modified.csv", parseLANUV),
		d3.csv("../data/Sensebox_Geist_19-12-19.csv", function(d) {
			return parseSensebox(d, "2019-12-19-");
		}),
		d3.csv("../data/bike_19-12.csv", parseBike)
	])
		.then(function(data) {
			lanuv1411 = data[0];
			sensebox1411 = data[1];
			bike1411 = data[2];
			lanuv1911 = data[3];
			sensebox1911 = data[4];
			bike1911 = data[5];

			console.log(
				"14.11.2019: LANUV: ",
				data[0],
				"senseBox: ",
				data[1],
				"Bike:",
				data[2],
				"/r/n  19.12.2019: LANUV: ",
				data[3],
				"senseBox: ",
				data[4],
				"Bike:",
				data[5]
			);
		})
		.catch(function(err) {
			if (err) throw err;
		});
}
