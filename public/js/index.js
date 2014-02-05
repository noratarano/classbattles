$(function() {
    
    var nav_h = $('.nav').height();
    var window_h = $(window).height();
    $('.content').css({'height': (window_h - nav_h) + 'px'});
    
    // Nav
    var max_w = Math.max($('.nav-left').outerWidth(), $('.nav-right').outerWidth());
    var window_w = $(window).width();
    $('.nav-middle').css({'width': (window_w - 2*max_w) + 'px'});
    $('.nav-left').css({'width': max_w + 'px'});
    $('.nav-right').css({'width': max_w + 'px'});
    
    // Index > Logo
    var cw = $('.index-logo-cont').width();
    $('.index-logo-cont').css({'width': cw + 'px'});
    $('.index-logo-cont').css({'height': (cw - 10) + 'px'});
    
    cw = $('.index-logo-text').width();
    $('.index-logo-text').css({'width': cw + 'px'});
    $('.index-logo-text').css({'height': cw + 'px'});
    
    // Index > Menu
    $(".menu-btn").tooltip({
        title: MenuHTML(),
        placement : 'top',
        trigger: 'click',
        html: true
    });
});

function MenuHTML() {
    // TODO: load with something else?
    $menu = $('<div class="btn-group-vertical">\n' +
        '<a href="#fakelink" class="btn btn-sm btn-inverse disabled">Home</a>\n' +
        '<a href="#fakelink" class="btn btn-sm btn-inverse disabled">Profile</a>\n' +
        '<a href="#fakelink" class="btn btn-sm btn-inverse">About</a>\n' +
        '<a href="#fakelink" class="btn btn-sm btn-inverse disabled logout-btn" >Log out</a>\n' +
    '</div>');
    return $menu.html();
}