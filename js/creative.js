(function($) {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 72)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 75
  });

  // Collapse Navbar
  var navbarCollapse = function() {
    if ($("#mainNav").offset().top > 100) {
      $("#mainNav").addClass("navbar-scrolled");
    } else {
      $("#mainNav").removeClass("navbar-scrolled");
    }
  };
  // Collapse now if page is not at top
  navbarCollapse();
  // Collapse the navbar when page is scrolled
  $(window).scroll(navbarCollapse);
  //Scroll Collapsables
  $('#RayTracer').on('shown.bs.collapse', function () {
      $('html, body').animate({
         scrollTop: $("#RayTracer").offset().top - 64
      }, 800);
  });

  $('#computervision').on('shown.bs.collapse', function () {
      $('html, body').animate({
         scrollTop: $("#computervision").offset().top - 64
      }, 800);
  });

  $('#ML').on('shown.bs.collapse', function () {
      $('html, body').animate({
         scrollTop: $("#ML").offset().top - 64
      }, 800);
  });

  $('#VP').on('shown.bs.collapse', function () {
      $('html, body').animate({
         scrollTop: $("#VP").offset().top - 64
      }, 800);
  });

  $('#GLSL').on('shown.bs.collapse', function () {
      $('html, body').animate({
         scrollTop: $("#GLSL").offset().top - 64
      }, 800);
  });

  $('#Forest').on('shown.bs.collapse', function () {
      $('html, body').animate({
         scrollTop: $("#Forest").offset().top - 64
      }, 800);
  });

  $('#SHOT').on('shown.bs.collapse', function () {
      $('html, body').animate({
         scrollTop: $("#SHOT").offset().top - 64
      }, 800);
  });

  // Magnific popup calls
  $('#portfolio').magnificPopup({
    delegate: 'a',
    type: 'image',
    tLoading: 'Loading image #%curr%...',
    mainClass: 'mfp-img-mobile',
    gallery: {
      enabled: true,
      navigateByImgClick: true,
      preload: [0, 1]
    },
    image: {
      tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
    }
  });

})(jQuery); // End of use strict
