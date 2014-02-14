$(function() {
	var charts = [];
	var classes = [];
	var classNames = [];
		
	var MAX_LABEL_CHARS = 7;
	var username = window.location.pathname.split('/')[1];
	
	$.get(window.location.origin + ['/api', username, 'class', 'all'].join('/'), makeProfile);
	
	function makeProfile(data, status) {
		makeClasses(data);
		makeCharts(data);
		colorLabels(data);
	}
	
	function makeClasses(data) {
		var classIndex = 0;
		for (c in data.classes) {
			var classObject = data.classes[c].class;
			classes.push(classObject);
			classNames.push(classObject.name);
		}
		var classProfile = window.location.pathname.indexOf("class") != -1;
		if (classProfile) {
			// class profile
			var classname = unescape(window.location.pathname.split('/')[3]);
			classIndex = classNames.indexOf(classname);
		} else {
			classIndex = 0;
		}
		
		if (classNames.length < 1) {
			$('.profile-classes').prepend('<br/><a href="/' + username + '/class/add" ' + 
			'class="btn btn-sm btn-block btn-default">You do not have any classes yet. Add classes.</a>');
		} else {
			displayClass(classIndex);
		}
	}
	
	function navClickEvent(e) {
		var index = parseInt($(this).attr('data-index'));
		displayClass(index);
	}
	
	function displayClass(i) {
		var prevIndex = (i-1) % classNames.length;
		prevIndex = prevIndex < 0 ? classNames.length + prevIndex : prevIndex;
		var nextIndex = (i+1) % classNames.length;
		$('.profile-class-cont').addClass('hidden');
		// setup current
		var url = '/' + [window.location.pathname.split('/')[1], 'class', escape(classNames[i])].join('/');
		$($('.profile-class-cont')[i]).removeClass('hidden');
		$('.profile-classes-curr').html(
			'<a href="' + url + '">' + 
			classNames[i] + '</a>')
			.attr('data-index', i);
		if (classNames.length > 1) {
			// setup the prev
			$('.profile-classes-prev').html(
				'<small><span class="fui-arrow-left"></span>' + 
				classNames[prevIndex] + '</small>')
				.attr('data-index', prevIndex)
				.unbind('click')
				.click(navClickEvent);
			// setup the next
			$('.profile-classes-next').html(
				'<small>' + classNames[nextIndex] + 
				'<span class="fui-arrow-right"></span></small>')
				.attr('data-index', nextIndex)
				.unbind('click')
				.click(navClickEvent);
		}
	}
	
	// TODO: get maximum possible points
	function makeCharts(data) {
		var i = 0;
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
		var $chart = $('.chart');
		for (var c = 0; c < $chart.length; c++) {
			var chartData = getChartData(data.classes[c].class);
			charts.push(new Chart($('.chart')[i].getContext("2d")).Radar(chartData, options));
			i+=1;
		}
	}
	
	function colorLabels(data) {
		function rgbaColor(rgb, a) {
			return 'rgba(' + rgb.join(',') + ',' + a + ')';
		}
		
		var colors = data.colors;
		var classes = data.classes;
		var $labels = $('.profile-class-tag');
		var i = 0;
		for (c in classes) {
			var classObject = classes[c].class;
			for (t in classObject.tags) {
				$($labels[i]).css({backgroundColor: rgbaColor(colors[t % colors.length].rgb, 1.0)});
				i++;
			}
		}
		
		$('.profile-class-tag').click(function(e) { e.preventDefault(); });
	}
	
	function getChartData(classObject) {
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
	
});