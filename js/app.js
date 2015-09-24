function initAutocomplete() {
	map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 42.360977, lng: -71.064238},
    zoom: 15,
    disableDefaultUI: true
  });

	// Create the search box and link it to the UI element.
  var input = document.getElementById('location-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    //prints out the location entered in input box (use with eventbrite)
    //console.log(document.getElementById("location-input").value);

    $.getJSON('https://www.eventbriteapi.com/v3/events/search/?q=hackathon&location.address=' + document.getElementById("location-input").value + '&token=7QJYTPRIY6MZY2SFNIQW',function (data) {
    	//console.log(data);
    	hackathons = data.events;
    	if (hackathons.length) {
    	console.log(data.events[0].name.text);
    }
    else {
    	console.log("There are no hackathons in that area");
    }
    });

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
}

var HackathonModel = function () {
	var self = this;
	self.ScrolltoMap = function () {
	   // animate
	   $('html, body').animate({
	       scrollTop: $('#map').offset().top
	     }, 300, function(){
	       // when done, add hash to url
	       window.location.hash = "#map";
		});
	};
};

