
/**
*
*@var bike1411;
*@var bike1912;
*@var sensebox1411;
*@var sensebox1912;
*@var lanuv1411;
*@var lanuv1912;
*@var guide1411;
*@var guide1912;
*/
var bike1411;
var bike1912;
var sensebox1411;
var sensebox1912;
var lanuv1411;
var lanuv1912;
var guide1411;
var guide1912;

/**
*
*@param
*/
function readAllData() {
			// DATA
		 return Promise.all([
			d3.csv("../data/lanuv_14Nov_modified.csv", parseLANUV),
			d3.csv("../data/Sensebox_Geist_14-11-19.csv", function (d) {
				return parseSensebox(d, "2019-11-14-");
			}),
			d3.csv("../data/bike_14-11.csv", parseBike),
			d3.csv("../data/lanuv_19Dec_modified.csv", parseLANUV),
			d3.csv("../data/Sensebox_Geist_19-12-19.csv", function (d) {
				return parseSensebox(d, "2019-12-19-");
			}),
			d3.csv("../data/bike_19-12.csv", parseBike),
			d3.csv("../data/guide_areas_14-11.csv", parseGuide),
			d3.csv("../data/guide_areas_19-12.csv", parseGuide)
		])
			.then(function (data) {
				lanuv1411 = data[0];
				sensebox1411 = data[1];
				bike1411 = data[2];
				lanuv1912 = data[3];
				sensebox1912 = data[4];
				bike1912 = data[5];
				guide1411 = data[6];
				guide1912 = data[7];

				console.log(
					"14.11.2019: LANUV: ",
					data[0],
					"senseBox: ",
					data[1],
					"Bike:",
					data[2],
					"guide",
					data[6],
					"19.12.2019: LANUV: ",
					data[3],
					"senseBox: ",
					data[4],
					"Bike:",
					data[5],
					"guide",
					data[7]
				);
			})
			.catch(function (err) {
				if (err) throw err;
			});
}
