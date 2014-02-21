// TODO: get maximum possible points
function makeChart($chart, classObject, MAX_LABEL_CHARS) {
	var options = {
        scaleShowLabels: false,
        pointLabelFontSize: 10,
		//Boolean - If we want to override with a hard coded scale
		scaleOverride : true,
		//** Required if scaleOverride is true **
		//Number - The number of steps in a hard coded scale
		scaleSteps : 5,
		//Number - The value jump in the hard coded scale
		scaleStepWidth : 3,
		//Number - The centre starting value
		scaleStartValue : 0
    };
	var chartData = getChartData(classObject, MAX_LABEL_CHARS);
	new Chart($chart[0].getContext("2d")).Radar(chartData, options);
}

function colorLabels($labels, colors) {
	function rgbaColor(rgb, a) {
		return 'rgba(' + rgb.join(',') + ',' + a + ')';
	}
	console.log(colors);
	for (var t = 0; t < $labels.length; t++) {
		$($labels[t]).css({backgroundColor: rgbaColor(colors[t % colors.length].rgb, 1.0)});
	}	
	$labels.click(function(e) { e.preventDefault(); });
}

function getChartData(classObject, MAX_LABEL_CHARS) {
	var labels = [];
	var points = [];
	for (t in classObject.tags) {
		labels.push(classObject.tags[t].tag.substring(0, MAX_LABEL_CHARS));
		points.push(classObject.tags[t].points);
	}
	
	return { 
		labels : labels,
		datasets : [
			{
				fillColor : "rgba(52, 73, 94, 0.5)",
				strokeColor : "rgba(52, 73, 94, 1.0)",
				pointColor : "rgba(52, 73, 94, 1.0)",
				pointStrokeColor : "rgba(52, 73, 94, 1.0)",
				data : points
			}
		],
	};
}