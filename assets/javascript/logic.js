var map;
var locationInput = "";
var typeInput = "";
var startMapCenter = new google.maps.LatLng(37.09024,-95.71289100000001);
var address;
var fireKey;
var resultsZone = $('#render-results');
var templateSrc = $('#thumbnail-template').html();
var templateReady = Handlebars.compile(templateSrc);



$("#clear-results").on('click', function() {
    clearResults();
});

resultsZone.on('click', '#pinned_bizzcard', function() {
  add($(this));
});


$(document).on('click', '#dltbutton', function() {
  event.stopPropagation();
  $(this).parent().remove();
  fireKey = $(this).parent().data("fire");
  removeItem(fireKey);
});

function removeItem(item) {
  database.ref(item).remove().then(function(){
    console.log("Item Removed");
  }).catch(function(err){
    console.log("Failed " + err.message);
  });
};

function appendHTML(img , name , address, phone , rating ) {
  var businessCard = "";
  businessCard += "<div class='card-template' id='pinned_bizzcard'>"
  businessCard += "<div class='contents-card'>"
  businessCard += "<div id='img-holder'>"
  businessCard += "<img class='thumbnailImg' src=" + img + ">"
  businessCard += "</div>"
  businessCard += "<div id='bizz-data'>"
  businessCard += "<h5 id='name-data'>" + name + "</h5>"
  businessCard += "<p id='address-data'>Address:" + address + "</p>"
  businessCard += "<p id='phone-data'>Phone Number:" + phone + "</p>"
  businessCard += "<p id='rating-data'>Ratings:" + rating + "</p>"
  businessCard += "</div>"
  businessCard += "</div>"

  resultsZone.append(businessCard);

  $(businessCard).on('click', '#dltbutton', function() {
    console.log("hi");
    $(this).parent().remove();
  });
};

function clearResults() {
    resultsZone.empty();
};

function initialize() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: startMapCenter,
    zoom: 3.5
  });
};

function runQuery() {
  locationInput = $("#location").val().trim();
  typeInput = $("#search").val().trim();
  console.log(typeInput);
  console.log(locationInput);
};

$("#userInputButton").on("click", function() {
  event.preventDefault();
  runQuery();

  // starts the api call
  var geocoder = new google.maps.Geocoder();
  var address = locationInput;
  var queryLatLng = "";
  var ipPass = "";
  var photoRef = "";

  if (geocoder) {
    geocoder.geocode({ 'address': address }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        // grabbing the lat and lng that come back from the geocoder api and logging them to console
        console.log(results[0].geometry.location.lat());
        console.log(results[0].geometry.location.lng());
        // defining the variable as the latlng in the right format to sent to the places api
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
            console.log(results[i]);
            idPass = results[i].place_id;
            console.log(idPass);


            function detailsCall() {



              var request = {
                placeId: idPass
              };

              service = new google.maps.places.PlacesService(map);
              service.getDetails(request, callback);



              function callback(resultsTwo, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                  var cardData = {
                    img: resultsTwo.photos[0].getUrl({"maxWidth":300,"minWidth":300}),
                    name: resultsTwo.name,
                    address: resultsTwo.formatted_address,
                    phone: resultsTwo.formatted_phone_number,
                    rating: resultsTwo.rating
                  }
                  console.log(cardData);

                  var thumbnailHb = templateReady(cardData);

                  $("#render-results").append(thumbnailHb);


                  // console.log(resultsTwo);
                  // console.log(resultsTwo.photos[0].getUrl({"maxWidth":300,"minWidth":300}));
                  // console.log(resultsTwo.name);
                  // console.log(resultsTwo.formatted_address);
                  // console.log(resultsTwo.formatted_phone_number);
                  // console.log(resultsTwo.rating);
                  // function appendHTML(img , name , phone , rating )
                  // appendHTML(resultsTwo.photos[0].getUrl({"maxWidth":200,"minWidth":200}) , resultsTwo.name , resultsTwo.formatted_address , resultsTwo.formatted_phone_number , resultsTwo.rating);
                }
              }

            };

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

});

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
  
    console.log("path to object: " + root);
    console.log("key: " + key);
    console.log(snapshot.val().name);
    console.log(snapshot.val().address);
    console.log(snapshot.val().phone);
    console.log(snapshot.val().rating);

    var businessCard = "";
        businessCard += "<div class='card-template' data-fire='" + key + "' id='pinned_bizzcard'>"
        businessCard += "<button id='dltbutton' type=‘button’>Delete</button>"
        businessCard += "<div class='contents-card'>"
        businessCard += "<div id='img-holder'>" 
        businessCard += "<img class='thumbnailImg' src=" + snapshot.val().img + ">"
        businessCard += "</div>"
        businessCard += "<div id='bizz-data'>"
        businessCard += "<h5 id='name-data'>" + snapshot.val().name + "</h5>"
        businessCard += "<p id='address-data'>" + snapshot.val().address + "</p>"
        businessCard += "<p id='phone-data'>" + snapshot.val().phone + "</p>"
        businessCard += "<p id='rating-data'>" + snapshot.val().rating + "</p>"
        businessCard += "</div>"
        businessCard += "</div>"
     
    $("#saved-contain").append(businessCard);

});


// Teting with handlebars 
// $(document).ready(function() {

  // var templateSrc = $('#thumbnail-template').html();
  // var templateReady = Handlebars.compile(templateSrc);

  // var testCardContent = {
  //   img: 'assets/images/travel.jpg',
  //   name: "test",
  //   address: "test",
  //   phone: "test",
  //   ratign: "test"
  // }

  // var thubnailHb = templateReady(testCardContent);

  // $("#render-results").html(thubnailHb);


// });
