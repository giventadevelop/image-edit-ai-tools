!(function($) {
    'use strict';
    // Back to top
    var $backToTop = $('.back-to-top');
    if ( $backToTop.length > 0 ) {
        $backToTop.click(function(event) {
            event.preventDefault();
            $('html,body').animate({
                scrollTop: '0px'
            }, 800);
        });
        $(window).scroll(function () {
            var scrollPosition = $(window).scrollTop();
            var windowHeight = $(window).height() / 2;
            if (scrollPosition > windowHeight) {
                $backToTop.addClass('in');
            }
            else {
                $backToTop.removeClass('in');
            }
        });
    }
    // Wow
    new WOW().init();
})(jQuery);