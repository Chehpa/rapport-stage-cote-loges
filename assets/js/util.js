(function($) {

  /* navList: génère une liste indentée de liens depuis un <nav> */
  $.fn.navList = function() {
    if (this.length === 0) return this;
    var $root = $(this),
        $a = $root.find('a'),
        out = [];

    $a.each(function() {
      var $link = $(this),
          indent = Math.max(0, $link.parents('li').length - 1),
          href = $link.attr('href'),
          target = $link.attr('target');

      out.push(
        '<a class="link depth-' + indent + '"' +
          (target ? ' target="' + target + '"' : '') +
          (href ? ' href="' + href + '"' : '') +
        '>' +
          '<span class="indent-' + indent + '"></span>' +
          $link.text() +
        '</a>'
      );
    });

    return out.join('');
  };

  /* panel: transforme un élément en panneau latéral */
  $.fn.panel = function(userConfig) {

    if (this.length === 0) return this;
    if (this.length > 1) { this.each(function(){ $(this).panel(userConfig); }); return this; }

    var $this = $(this),
        $body = $('body'),
        $window = $(window),
        id = $this.attr('id'),
        config = $.extend({
          delay: 0,
          hideOnClick: false,
          hideOnEscape: false,
          hideOnSwipe: false,
          resetScroll: false,
          resetForms: false,
          side: null,
          target: $this,
          visibleClass: 'visible'
        }, userConfig);

    if (!(config.target && (config.target.jquery || config.target instanceof $))) {
      config.target = $(config.target);
    }

    $this._hide = function(event) {
      if (!config.target.hasClass(config.visibleClass)) return;
      if (event) { event.preventDefault(); event.stopPropagation(); }

      config.target.removeClass(config.visibleClass);

      window.setTimeout(function() {
        if (config.resetScroll) $this.scrollTop(0);
        if (config.resetForms) $this.find('form').each(function() { this.reset(); });
      }, config.delay);
    };

    // Vendor fixes
    $this
      .css('-ms-overflow-style', '-ms-autohiding-scrollbar')
      .css('-webkit-overflow-scrolling', 'touch');

    // Hide on click
    if (config.hideOnClick) {
      $this.find('a').css('-webkit-tap-highlight-color', 'rgba(0,0,0,0)');
      $this.on('click', 'a', function(event) {
        var $a = $(this),
            href = $a.attr('href'),
            target = $a.attr('target');

        if (!href || href === '#' || href === '' || href === '#' + id) return;

        event.preventDefault(); event.stopPropagation();
        $this._hide();

        window.setTimeout(function() {
          if (target === '_blank') window.open(href);
          else window.location.href = href;
        }, config.delay + 10);
      });
    }

    // Touch: swipe + scroll clamps
    $this.on('touchstart', function(event) {
      var t = event.originalEvent.touches && event.originalEvent.touches[0];
      if (!t) return;
      $this.touchPosX = t.pageX;
      $this.touchPosY = t.pageY;
    });

    $this.on('touchmove', function(event) {
      if ($this.touchPosX == null || $this.touchPosY == null) return;

      var t = event.originalEvent.touches && event.originalEvent.touches[0];
      if (!t) return;

      var diffX = $this.touchPosX - t.pageX,
          diffY = $this.touchPosY - t.pageY,
          th = $this.outerHeight(),
          ts = ($this.get(0).scrollHeight - $this.scrollTop());

      if (config.hideOnSwipe) {
        var result = false, boundary = 20, delta = 50;
        switch (config.side) {
          case 'left':   result = (Math.abs(diffY) < boundary) && (diffX >  delta); break;
          case 'right':  result = (Math.abs(diffY) < boundary) && (diffX < -delta); break;
          case 'top':    result = (Math.abs(diffX) < boundary) && (diffY >  delta); break;
          case 'bottom': result = (Math.abs(diffX) < boundary) && (diffY < -delta); break;
        }
        if (result) {
          $this.touchPosX = $this.touchPosY = null;
          $this._hide();
          return false;
        }
      }

      // Clamp overscroll
      if (($this.scrollTop() < 0 && diffY < 0) || (ts > (th - 2) && ts < (th + 2) && diffY > 0)) {
        event.preventDefault(); event.stopPropagation();
      }
    });

    // Prevent bubbling inside panel
    $this.on('click touchend touchstart touchmove', function(event) { event.stopPropagation(); });

    // Hide if clicking link to self
    $this.on('click', 'a[href="#' + id + '"]', function(event) {
      event.preventDefault(); event.stopPropagation();
      config.target.removeClass(config.visibleClass);
    });

    // Body bindings
    $body.on('click touchend', function(event) { $this._hide(event); });

    $body.on('click', 'a[href="#' + id + '"]', function(event) {
      event.preventDefault(); event.stopPropagation();
      config.target.toggleClass(config.visibleClass);
    });

    if (config.hideOnEscape) {
      $window.on('keydown', function(event) {
        if (event.keyCode === 27) $this._hide(event);
      });
    }

    return $this;
  };

  /* placeholder polyfill */
  $.fn.placeholder = function() {
    if (typeof (document.createElement('input')).placeholder !== 'undefined') return $(this);
    if (this.length === 0) return this;
    if (this.length > 1) { this.each(function(){ $(this).placeholder(); }); return this; }

    var $root = $(this);

    $root.find('input[type=text],textarea')
      .each(function() {
        var i = $(this);
        if (i.val() === '' || i.val() === i.attr('placeholder'))
          i.addClass('polyfill-placeholder').val(i.attr('placeholder'));
      })
      .on('blur', function() {
        var i = $(this);
        if (/-polyfill-field$/.test(i.attr('name'))) return;
        if (i.val() === '') i.addClass('polyfill-placeholder').val(i.attr('placeholder'));
      })
      .on('focus', function() {
        var i = $(this);
        if (/-polyfill-field$/.test(i.attr('name'))) return;
        if (i.val() === i.attr('placeholder')) i.removeClass('polyfill-placeholder').val('');
      });

    $root.find('input[type=password]').each(function() {
      var i = $(this);
      var x = $(
        $('<div>').append(i.clone()).remove().html()
          .replace(/type="password"/i, 'type="text"')
          .replace(/type=password/i, 'type=text')
      );

      if (i.attr('id'))   x.attr('id',   i.attr('id')   + '-polyfill-field');
      if (i.attr('name')) x.attr('name', i.attr('name') + '-polyfill-field');

      x.addClass('polyfill-placeholder').val(x.attr('placeholder')).insertAfter(i);

      if (i.val() === '') i.hide(); else x.hide();

      i.on('blur', function(e) {
        e.preventDefault();
        var x = i.parent().find('input[name=' + i.attr('name') + '-polyfill-field]');
        if (i.val() === '') { i.hide(); x.show(); }
      });

      x.on('focus', function(e) {
        e.preventDefault();
        var i2 = x.parent().find('input[name=' + x.attr('name').replace('-polyfill-field', '') + ']');
        x.hide(); i2.show().focus();
      }).on('keypress', function(e) { e.preventDefault(); x.val(''); });
    });

    $root.on('submit', function() {
      $root.find('input[type=text],input[type=password],textarea').each(function() {
        var i = $(this);
        if (/-polyfill-field$/.test(i.attr('name'))) i.attr('name', '');
        if (i.val() === i.attr('placeholder')) { i.removeClass('polyfill-placeholder'); i.val(''); }
      });
    }).on('reset', function(e) {
      e.preventDefault();
      $root.find('select').val($('option:first').val());
      $root.find('input,textarea').each(function() {
        var i = $(this), x;
        i.removeClass('polyfill-placeholder');
        switch (this.type) {
          case 'submit':
          case 'reset': break;
          case 'password':
            i.val(i.attr('defaultValue'));
            x = i.parent().find('input[name=' + i.attr('name') + '-polyfill-field]');
            if (i.val() === '') { i.hide(); x.show(); } else { i.show(); x.hide(); }
            break;
          case 'checkbox':
          case 'radio':
            i.prop('checked', !!i.attr('defaultValue'));
            break;
          case 'text':
          case 'textarea':
            i.val(i.attr('defaultValue'));
            if (i.val() === '') { i.addClass('polyfill-placeholder').val(i.attr('placeholder')); }
            break;
          default:
            i.val(i.attr('defaultValue'));
        }
      });
    });

    return $root;
  };

  /* prioritize: remonte des éléments en tête de parent si condition vraie */
  $.prioritize = function($elements, condition) {
    var key = '__prioritize';
    if (!($elements && ($elements.jquery || $elements instanceof $))) $elements = $($elements);

    $elements.each(function() {
      var $e = $(this), $p, $parent = $e.parent();
      if ($parent.length === 0) return;

      if (!$e.data(key)) {
        if (!condition) return;
        $p = $e.prev();
        if ($p.length === 0) return;
        $e.prependTo($parent);
        $e.data(key, $p);
      } else {
        if (condition) return;
        $p = $e.data(key);
        $e.insertAfter($p);
        $e.removeData(key);
      }
    });
  };

})(jQuery);
