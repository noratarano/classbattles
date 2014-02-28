$(function() {
    var username = null;
    
    // Content
    var nav_h = $('.nav').height();
    var window_h = $(window).height();
	var body_h = $('body').height();
    $('.content').css({'height': (window_h - nav_h) + 'px'});
    
    // Nav
    var max_w = Math.max($('.nav-left').outerWidth(), $('.nav-right').outerWidth());
    var window_w = $(window).width();
    $('.nav-middle').css({'width': (window_w - 2*max_w) + 'px'});
    $('.nav-left').css({'width': max_w + 'px'});
    $('.nav-right').css({'width': max_w + 'px'});
    
    // Menu
	var menu_open = false;
	if (!b_test) {
	    $(".menu-btn").tooltip({
	        title: $('.menu-guide').html(),
	        placement : 'top',
	        trigger: 'click',
	        html: true
	    });
	} else {
		$('.menu-cont').css({'position': 'fixed'});
		$('.menu-guide').removeClass('hidden').css({ 'margin-top': '-24px' });
		$('.menu-guide').find('a:last').css({ 'border-radius': '0' });
		var menu_width = parseInt($('.menu-guide > .btn-group-vertical').outerWidth());
		var menu_height = parseInt($('.menu-guide > .btn-group-vertical').outerHeight());
		$('.menu-cont').mousedown(function() {
			if (menu_open) {
				$('.menu-cont').animate({ bottom: 0 });
			} else {
				$('.menu-cont').animate({ bottom: menu_height });
			}
			menu_open = !menu_open;
		});
	}
});