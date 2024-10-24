// Preloader
document.addEventListener("DOMContentLoaded", function() {
    // Hide the preloader when the page is fully loaded
    window.onload = function() {
        var preloader = document.getElementById('load');
        preloader.style.opacity = '0';
        setTimeout(function() {
            preloader.style.display = 'none';
        }, 1000); // Matches the CSS transition duration
    };
});

// Brands HOME
$(document).ready(function(){
    $('#carousel').carousel();
});

$(document).ready(function() {
    var carousel = document.getElementById('carousel');
    var hammertime = new Hammer(carousel);

    hammertime.on('swipeleft', function() {
        $(carousel).carousel('next');
    });

    hammertime.on('swiperight', function() {
        $(carousel).carousel('prev');
    });
});

