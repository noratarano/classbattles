$(function() {
    var username = null;
    
    // Content
    var nav_h = $('.nav').height();
    var window_h = $(window).height();
    $('.content').css({'height': (window_h - nav_h) + 'px'});
    
    // Nav
    var max_w = Math.max($('.nav-left').outerWidth(), $('.nav-right').outerWidth());
    var window_w = $(window).width();
    $('.nav-middle').css({'width': (window_w - 2*max_w) + 'px'});
    $('.nav-left').css({'width': max_w + 'px'});
    $('.nav-right').css({'width': max_w + 'px'});    
    
    // Menu
    $(".menu-btn").tooltip({
        title: $('.menu-guide').html(),
        placement : 'top',
        trigger: 'click',
        html: true
    });
});