var HackathonViewModel = function () {
	var self = this;
  var map;
  var markers = [];
  var bounds;
  var autocomplete;
  var hackathons = [];
  self.loc = ko.observable();
  self.hackathonList = ko.observableArray();

  initMapLoad();

  self.months = ko.observableArray([
    {name: 'January'},
    {name: 'February'}, 
    {name: 'March'}, 
    {name: 'April'}, 
    {name: 'May'}, 
    {name: 'June'},
    {name: 'July'},
    {name: 'August'},
    {name: 'September'},
    {name: 'October'},
    {name: 'November'},
    {name: 'December'},
    {name: 'Show All'}
  ]);
  

  self.findHackathons = function() {
    if (self.loc()==undefined) {
      alert("Please enter a search location")
    }
    else {
    hackathons = [];
    updateMap(self.loc()); 
    }
  };

  self.highlightMarker = function(index) {
    google.maps.event.trigger(markers[index], 'click');
  };

  self.collapseList = function() {
    $("#collapse").toggleClass("fa-minus-circle fa-plus-circle");
    $("#hlist").toggleClass("hide");
  };

  self.filterByMonth = function(index) {
    //console.log(index);
    if(index!=12){
      for(var i in hackathons) {
        if(hackathons[i].month!=index) {
          hackathons[i].showHackathon(false);
          //Todo: hide markers
        }
      }
    }
    else {
        for(var j in hackathons) {
          hackathons[j].showHackathon(true);
        }
      }
      self.hackathonList(hackathons);
  };

  function initMapLoad() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 42.360977, lng: -71.064238},
    zoom: 14,
    disableDefaultUI: true
  });

  updateMap('Boston');

  autocomplete = new google.maps.places.Autocomplete(
      (document.getElementById('location-input')),
      {types: ['geocode']});

  // When the user selects an address from the dropdown, populate the address
  // fields in the form.
  autocomplete.addListener('place_changed', function() {
    document.getElementById('location-input').focus();
  });
}

  function updateMap(location) {
    bounds = new google.maps.LatLngBounds();
    removeMarkers();
    getHackathons(location);
    //pan to new location
    var mygeocoder = new google.maps.Geocoder();
    mygeocoder.geocode({'address' : location}, function(results, status){
      var panPoint = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
      map.panTo(panPoint)
    });
  }

  //removes old markers from map
  function removeMarkers() {
    for (var i in markers) {
      markers[i].setMap(null);
    }
    markers = [];
  }

  function getHackathons(location) {
    $.getJSON('https://www.eventbriteapi.com/v3/events/search/?q=hackathon&location.address=' + location + '&token=JWBASFKW3ABNKRUABOGW&expand=venue', function (data) {
      var hackathon = data.events;
      if (hackathon.length) {
        for(var i in hackathon) {
          var d = new Date(hackathon[i].start.utc);
          var m = d.getMonth();
          var date = d.toLocaleDateString();
          var time = d.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});;
          var info = {
            eventName: hackathon[i].name.text, 
            lat: hackathon[i].venue.address.latitude, 
            lng: hackathon[i].venue.address.longitude,
            addressName: hackathon[i].venue.name, 
            logo: 'img/code28.png', 
            eventUrl: hackathon[i].url, 
            startDate: hackathon[i].start.utc, 
            endDate: hackathon[i].end.utc,
            formattedDate: date,
            formattedTime: time,
            month: m,
            showHackathon: ko.observable(true)
          }
          if(hackathon[i].logo!==null) {
            info.logo = hackathon[i].logo.url;
          }
          hackathons.push(info);
        } 
        addMarkers();
        self.hackathonList(hackathons);
      }
      else {
        alert('Sorry, we could not find any hackathons in ' + location + ' :(');
      }
    });
  }

  //adds new markers to map
  function addMarkers() {
    for(var i in hackathons) {
      
      
        var hackContent = '<h4>' + hackathons[i].eventName + '</h4>' +
        '<p>' + hackathons[i].addressName + '</p>' +
        '<p>' + hackathons[i].formattedDate + ' | ' + hackathons[i].formattedTime + '</p>' + 
        '<a href="' + hackathons[i].eventUrl + '">View on Eventbrite</a>';
      
      infoWindow = new google.maps.InfoWindow({ 
        content: hackContent, 
        maxWidth: 300 });
      var myLatLng = {lat: hackathons[i].lat, lng: hackathons[i].lng};
      markers.push(new google.maps.Marker({
        position: myLatLng,
        animation: google.maps.Animation.DROP,
        info: hackContent,
        map: map
      }));
      bounds.extend(markers[i].position);

      google.maps.event.addListener( markers[i], 'click', function() {
        infoWindow.setContent( this.info );
        infoWindow.open( map, this );
      });

       google.maps.event.addListener( markers[i], 'mouseover', function() {
        this.setAnimation(google.maps.Animation.BOUNCE);
      });

       google.maps.event.addListener( markers[i], 'mouseout', function() {
        if (this.getAnimation() !== null) {
          this.setAnimation(null);
        }
      });
    }
    map.fitBounds(bounds);
  }
}

$(document).ready(function() {
  ko.applyBindings(new HackathonViewModel());
});