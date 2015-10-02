function initMapLoad() {
	map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 42.360977, lng: -71.064238},
    zoom: 15,
    disableDefaultUI: true
  });

	// Create the search box and link it to the UI element.
  var input = document.getElementById('location-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
}

function updateMap(location) {
  getHackathons(location);
  //TODO: Clear old markers
  //pan to new location
  var mygeocoder = new google.maps.Geocoder();
  mygeocoder.geocode({'address' : location}, function(results, status){
  //console.log( "latitude : " + results[0].geometry.location.lat() );
  //console.log( "longitude : " + results[0].geometry.location.lng() );
  var panPoint = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
        map.panTo(panPoint)
});
  //TODO: add markers for each hackathon
    //addMarkers(location, map);

}

function addMarkers(location, map) {
  // Add marker at each hackathon location
  var marker = new google.maps.Marker({
    position: location,
    label: 'H',
    map: map
  });
}

function getHackathons(location) {
$.getJSON('https://www.eventbriteapi.com/v3/events/search/?q=hackathon&location.address=' + location + '&token=7QJYTPRIY6MZY2SFNIQW',function (data) {
      hackathons = data.events;
      var venues = [];
      if (hackathons.length) {
        //adds venue_id for each hackathon into an array
        for(var i = 0; i < hackathons.length; i++){
          venues.push(data.events[i].venue_id)
          //console.log(data.events[i].venue_id);
        }
      }
    else {
      console.log("There are no hackathons in that area");
    }
    console.log(venues);
    });
}

var HackathonViewModel = function () {
	var self = this;
  self.loc = ko.observable();
  self.findHackathons = function() {
    //TODO: Check if inputbox is empty
    updateMap(self.loc());
  };

}

$(document).ready(function() {
  ko.applyBindings(new HackathonViewModel());
});

