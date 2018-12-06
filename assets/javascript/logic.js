var map;
var locationInput = "";
var typeInput = "";
var startMapCenter = new google.maps.LatLng(37.09024,-95.71289100000001);
var address;
var fireKey;
var resultsZone = $('#render-results');
var templateSrc = $('#thumbnail-template').html();
var templateSrcFire = $('#thumbnail-template-fire').html();
var templateReady = Handlebars.compile(templateSrc);
var templateReadyFire = Handlebars.compile(templateSrcFire);
var cardData;

function removeItem(item) {
  database.ref(item).remove().then(function(){
    console.log("Key: " + item + " Removed From Database");
  }).catch(function(err){
    console.log("Failed " + err.message);
  });
};

function initialize() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: startMapCenter,
    zoom: 3.5
  });
};

function detailsCall() {

  var request = {
    placeId: idPass
  };

  service = new google.maps.places.PlacesService(map);
  service.getDetails(request, callback);



  function callback(resultsTwo, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      cardData = {
        key: null,
        img: resultsTwo.photos[0].getUrl({"maxWidth":300,"minWidth":300}),
        name: resultsTwo.name,
        address: resultsTwo.formatted_address,
        phone: resultsTwo.formatted_phone_number,
        rating: resultsTwo.rating
      }

      var thumbnailHb = templateReady(cardData);

      $("#render-results").append(thumbnailHb);

    }
  }

};

function takeInput() {
  locationInput = $("#location").val().trim();
  typeInput = $("#search").val().trim();
};

  // starts the  places api call
function runQuery() {

  takeInput();

  var geocoder = new google.maps.Geocoder();
  var address = locationInput;
  var queryLatLng = "";

  if (geocoder) {
    geocoder.geocode({ 'address': address }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        // defining the variable as the latlng in the right format for the places api
        queryLatLng = new google.maps.LatLng(results[0].geometry.location.lat(),results[0].geometry.location.lng());
      }
      else {
        console.log("Geocoding failed: " + status);
      }
      // this is when the map will chang based on search location
      mapAdjust();
      // start of the places api query

      var request = {
        location: queryLatLng,
        radius: '5000',
        keyword: [ typeInput ]
      };

      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, callback);

      function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          for (var i = 0; i < results.length; i++) {
            var place = results[i];
            createMarker(results[i]);
            idPass = results[i].place_id;

            detailsCall();

          }
        }
      }

      function mapAdjust() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: queryLatLng,
          zoom: 13
        });
      };

      function createMarker(place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location
        });
      };

    });

  }
};


google.maps.event.addDomListener(window, 'load', initialize);


//  firebase

var config = {
  apiKey: "AIzaSyCCEyzM-m-7cfyMCZBTBEGSK5LDBgcSj7I",
  authDomain: "businesssearch-60a3e.firebaseapp.com",
  databaseURL: "https://businesssearch-60a3e.firebaseio.com",
  projectId: "businesssearch-60a3e",
  storageBucket: "businesssearch-60a3e.appspot.com",
  messagingSenderId: "503853592240"
};

firebase.initializeApp(config);

var database = firebase.database();


function add(card) {
  event.preventDefault();

  var newBusiness = {
    img: $(card).find(".thumbnailImg").attr("src"),
    name: $(card).find("#name-data").text().trim(),
    address: $(card).find("#address-data").text().trim(),
    phone: $(card).find("#phone-data").text().trim(),
    rating: $(card).find("#rating-data").text().trim()
  };

  database.ref().push(newBusiness);

};


database.ref().on("child_added", function(snapshot){

    var root = snapshot.ref;
    var key = database.ref(root).key;

    cardData = {
      key: key,
      img: snapshot.val().img,
      name: snapshot.val().name,
      address: snapshot.val().address,
      phone: snapshot.val().phone,
      rating: snapshot.val().rating
    }

    var thumbnailHb = templateReadyFire(cardData);

    $("#saved-contain").append(thumbnailHb);

});

