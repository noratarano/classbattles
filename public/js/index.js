$(function() {
    // Index > Logo
    /*var cw = $('.index-logo-cont').width();
    $('.index-logo-cont').css({'width': cw + 'px'});
    $('.index-logo-cont').css({'height': (cw - 10) + 'px'});
    // Index > Logo > Text
    cw = $('.index-logo-text').width();
    $('.index-logo-text').css({'width': cw + 'px'});
    $('.index-logo-text').css({'height': cw + 'px'});
    */
    // Index > Menu
    Menu('<div class="btn-group-vertical">\n' +
        '<a href="/login" class="btn btn-sm btn-inverse btn-wide menu-login-btn">Log in</a>\n' + 
        '<a href="/signup" class="btn btn-sm btn-inverse btn-wide menu-signup-btn">Sign up</a>\n' + 
        '<a href="/about" class="btn btn-sm btn-inverse btn-wide menu-about-btn">About</a>\n' +
    '</div>');
    
    // Events

});