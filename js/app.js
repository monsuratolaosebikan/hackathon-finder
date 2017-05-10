var map;

function initMapLoad() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 42.360977, lng: -71.064238},
    zoom: 14,
    disableDefaultUI: true
  });

  autocomplete = new google.maps.places.Autocomplete((document.getElementById('location-input')),{types: ['geocode']});

  //When the user selects a location from the dropdown, populate search box
  autocomplete.addListener('place_changed', function() {
    document.getElementById('location-input').focus();
  });

  ko.applyBindings(new HackathonViewModel());
}

function googleMapError() {
  alert("Google Maps failed to load, make sure you're connected to the internet and try refreshing the page.");
}

var HackathonViewModel = function () {
  var self = this;
  var bounds;
  var autocomplete;
  var hackathons = [];
  var noHackathons = false;
  var currentLocation;
  self.loc = ko.observable();
  self.query = ko.observable("");
  self.hackathonList = ko.observableArray();
  self.noneFound = ko.observable();

  //initialize map with hackathons in Boston
  updateMap('Boston,MA');

  self.findHackathons = function() {
    if (self.loc()===undefined) {
      alert("Please enter a search location");
    }
    else {
      currentLocation = self.loc();
      updateMap(self.loc()); 
    }
  };

  self.noHackathons = ko.observable(false);

  self.highlightMarker = function(index) {
    google.maps.event.trigger(self.hackathonList()[index].mark, 'click');
  };

  self.filterHackathons = function () {
      var filter = self.query().toLowerCase();

      if (!filter) {
        self.hackathonList(hackathons);
        for (var i in hackathons) {
          hackathons[i].mark.setMap(map);
        }
      }
      else {
        self.hackathonList([]);
        for (var j = 0; j<hackathons.length; j++) {
          hackathons[j].mark.setMap(null);
        }
        for(var k in hackathons) {
          if(hackathons[k].eventName.toLowerCase().indexOf(filter.toLowerCase()) >= 0 || hackathons[k].formattedDate.toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
            self.hackathonList.push(hackathons[k]);
            hackathons[k].mark.setMap(map);
          }
        }
      }
  };

  function updateMap(location) {
    bounds = new google.maps.LatLngBounds();
    removeMarkers();
    hackathons.length = 0;
    getHackathons(location);
    //pan to new location
    var mygeocoder = new google.maps.Geocoder();
    mygeocoder.geocode({'address' : location}, function(results, status){
      var panPoint = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
      map.panTo(panPoint);
    });
  }

  //removes old markers from map
  function removeMarkers() {
    for (var i in hackathons) {
      hackathons[i].mark.setMap(null);
    }
  }

  function getHackathons(location) {
    $.getJSON('https://www.eventbriteapi.com/v3/events/search/?q=hackathon&location.address=' + location + '&token=JWBASFKW3ABNKRUABOGW&expand=venue', function (data) {
      var hackathon = data.events;
      if (hackathon.length) {
        self.noHackathons(false);
        for(var i in hackathon) {
          var d = new Date(hackathon[i].start.utc);
          var date = d.toLocaleDateString();
          var time = d.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});
          var info = {
            eventName: hackathon[i].name.text, 
            lat: parseFloat(hackathon[i].venue.address.latitude),
            lng: parseFloat(hackathon[i].venue.address.longitude),
            addressName: hackathon[i].venue.name, 
            logo: '', 
            eventUrl: hackathon[i].url, 
            startDate: hackathon[i].start.utc, 
            endDate: hackathon[i].end.utc,
            formattedDate: date,
            formattedTime: time,
          };
          if(hackathon[i].logo!==null) {
            info.logo = hackathon[i].logo.url;
          }
          hackathons.push(info);
        } 
        addMarkers();
        self.hackathonList(hackathons);
      }
      else {
        self.hackathonList([]);
        self.noneFound("Unfortunately, there are no hackathons in " + location + ". Check back again later or try a new search.");
        self.noHackathons(true);
      }
    }).fail(function(error){
      alert("There was an error loading the hackathons, please refresh the page and try agian");
    });
  }

  //adds new markers to map with infowindows
  function addMarkers() {
    for(var i in hackathons) {
      var hackContent = '<h4>' + hackathons[i].eventName + '</h4>' +
      '<p>' + hackathons[i].addressName + '</p>' +
      '<p>' + hackathons[i].formattedDate + ' | ' + hackathons[i].formattedTime + '</p>' + 
      '<a href="' + hackathons[i].eventUrl + '" target="_blank">View on Eventbrite</a>';
      
      infoWindow = new google.maps.InfoWindow({ 
        content: hackContent, 
        maxWidth: 300 
      });

      var myLatLng = {lat: hackathons[i].lat, lng: hackathons[i].lng};
      hackathons[i].mark = new google.maps.Marker({
        position: myLatLng,
        animation: google.maps.Animation.DROP,
        info: hackContent,
        map: map
      });

      bounds.extend(hackathons[i].mark.position);
      
      google.maps.event.addListener(hackathons[i].mark, 'mouseover', function() {
        this.setAnimation(google.maps.Animation.BOUNCE);
      });

       google.maps.event.addListener(hackathons[i].mark, 'mouseout', function() {
        if (this.getAnimation() !== null) {
          this.setAnimation(null);
        }
      });

       google.maps.event.addListener(hackathons[i].mark, 'click', function() {
        infoWindow.setContent(this.info);
        infoWindow.open(map, this);
      });
    }
    map.fitBounds(bounds);
  }
};
