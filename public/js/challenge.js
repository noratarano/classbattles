$(function() {
	var timeleft = 20;
    timer();
	
	var abandon = false;
    
    $('.submitBtn').click(function(e) {
        e.preventDefault();
        $('form').trigger('submit');
    });
    
    $('.radio').click(function(e) {
        $('.submitBtn').removeClass('disabled');
    });
	    
    function timer() {
        var $timeleft = $('.timeleft');
        if ($timeleft.length > 0) {
            $timeleft.text(timeleft--);
            if (timeleft > -1) {
                setTimeout(timer, 1000);
            } else {
                var $options = $('input:radio[name=selected]');
                for (var i = 0; i < $options.length; i++) {
                    var option = $options[i];
                    option.checked = false;
                }
                $('input:text[name=timedOut]').val('true');
                $('form').trigger('submit');
            }
        }
    }
});