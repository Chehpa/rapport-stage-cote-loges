/*
  Spectral by HTML5 UP
  html5up.net | @ajlkn
  Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($){

  var $window = $(window),
      $body   = $('body'),
      $wrapper = $('#page-wrapper'),
      $banner = $('#banner'),
      $header = $('#header');

  // Breakpoints.
  breakpoints({
    xlarge: [ '1281px', '1680px' ],
    large:  [ '981px',  '1280px' ],
    medium: [ '737px',  '980px'  ],
    small:  [ '481px',  '736px'  ],
    xsmall: [ null,     '480px'  ]
  });

  // Initial animations.
  $window.on('load', function(){
    window.setTimeout(function(){ $body.removeClass('is-preload'); }, 100);
  });

  // Mobile switch.
  if (browser.mobile) $body.addClass('is-mobile');
  else {
    breakpoints.on('>medium', function(){ $body.removeClass('is-mobile'); });
    breakpoints.on('<=medium', function(){ $body.addClass('is-mobile'); });
  }

  // Helper: current header offset (memoized per call site)
  function headerOffset(){
    // use outerHeight (includes borders), recalc on demand
    return $header.outerHeight();
  }

  // Scrolly.
  $('.scrolly').scrolly({
    speed: 1500,
    offset: headerOffset
  });

  // Menu.
  $('#menu')
    .append('<a href="#menu" class="close"></a>')
    .appendTo($body)
    .panel({
      delay: 500,
      hideOnClick: true,
      hideOnSwipe: true,
      resetScroll: true,
      resetForms: true,
      side: 'right',
      target: $body,
      visibleClass: 'is-menu-visible'
    });

  // Header alt toggle on banner scroll.
  if ($banner.length > 0 && $header.hasClass('alt')) {

    var resizeRaf = null;
    $window.on('resize', function(){
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(function(){
        resizeRaf = null;
        $window.trigger('scroll');
      });
    });

    $banner.scrollex({
      bottom:   function(){ return headerOffset() + 1; },
      terminate: function(){ $header.removeClass('alt'); },
      enter:     function(){ $header.addClass('alt'); },
      leave:     function(){ $header.removeClass('alt'); }
    });
  }

})(jQuery);
