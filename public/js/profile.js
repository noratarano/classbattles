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
		makeLabels(data);
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
		var $chart = $('.chart');
		for (var c = 0; c < $chart.length; c++) {
			makeChart($($chart[i]), data.classes[c].class, MAX_LABEL_CHARS);
			i+=1;
		}
	}
	
	function makeLabels(data) {
		var colors = data.colors;
		var classes = data.classes;
		var i = 0;
		for (c in classes) {
			var classObject = classes[c].class;
			var $labels = $($('.profile-class-tags')[i]).find('.profile-class-tag');
			colorLabels($labels, colors);
			i++
		}		
	}
});