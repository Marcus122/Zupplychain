define(['async!https://maps.googleapis.com/maps/api/js' , "jquery"], function (GM, $) {

    
    function Class(postcode, radius) {
    
        var MAP_ELEM_ID = "map-container"
        var RESULT_INFO_ELEM_SELECTOR = "#search-results-info";
        var restrictions = {"country" : "UK"}; //https://developers.google.com/maps/documentation/geocoding/#ComponentFiltering
        var markers = []
        var selectedMarkerIndex =0;
        var map;
        var circle;
        var factoryData;
        var centerLatLong;
        var normalIcon = {
              url  : "/images/map-icon.png"
          }
          
          var highlightIcon = {
            url  : "/images/map-icon-highlight.png"
          }
          
          var markerOptions;
          
          
          
        
        function initialize(postcode, radius) {
          var loc1 = new google.maps.LatLng(0,0);
          var mapOptions = {
            center: loc1,
            zoom: 14
          };
          map = new google.maps.Map( document.getElementById(MAP_ELEM_ID), mapOptions);
          
          markerOptions = {
              icon: normalIcon,
              map:map,
              animation:'DROP'
          }
          
          centerMapAtPostCode(postcode, map, radius);
          
          function centerMapAtPostCode(postcode, map, radius) {
              
              if (!radius) {
                  radius = 20;//default 20 miles;
              } //TODO: have a local API that we use for this.
                geocoder = new google.maps.Geocoder();
              geocoder.geocode( { 'address': postcode, "componentRestrictions":restrictions}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                  
                  var latlong = results[0].geometry.location;
                    var loc2 = new google.maps.LatLng(latlong.latitude, latlong.longitude);
                    centerLatLong = latlong;
                    map.setCenter(latlong);
                    setRadius(radius);
                } else {
                  alert('Geocode was not successful for the following reason: ' + status);
                }
              });
          }
        }
        
        function setRadius(radiusInMiles) {
            
            var GLOBE_WIDTH = 256; // a constant in Google's map projection
             var angle = radiusInMiles/69;//east - west;
            if (angle < 0) {
                angle += 360;
            }
            var pixelWidth = $("#" + MAP_ELEM_ID).width();
            var zoom = Math.round(Math.log(pixelWidth * 360 / angle / GLOBE_WIDTH) / Math.LN2);
            map.setZoom(zoom-4);
            //zoom is the zoom required to fit those points on the map.
            var miles = radiusInMiles;
               var radiusOptions = {
                strokeColor: '#37bbec',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#c3eaf9',
                fillOpacity: 0.35,
                map: map,
                center:centerLatLong, //map.getCenter(),
                radius: miles * 1609.344
                };
                if (circle){
                    circle.setMap(null);
                }
                circle = new google.maps.Circle(radiusOptions);
            
        }
        
        function clear() {
            //delete all the markers and reset the display area;
            var lim = markers.length;
            for (var i = 0; i< lim; markers[i++].setMap(null));
            factoryData = {};
           markers = [];
           selectedMarkerIndex = 0;
           $('#search-results-info').fadeOut();
            
        }
        
        function load(data) {
           clear();
           
           if (data.length < 1) {
               return false;
           }
          factoryData = data;
          $('#search-results-info').fadeIn();
          var lim = data.length;
          for (var i =0;i<lim;i++) {
              var position = new google.maps.LatLng(data[i].geo.lat, data[i].geo.lng);
              
              var thisMarkerOptions = $.extend(markerOptions, {
                title : data[i].name,
                position : position,
                icon : normalIcon
              });
              if (i==0) {
                  thisMarkerOptions.icon = highlightIcon;
              }
              
              var thisMarker = new google.maps.Marker(thisMarkerOptions);
              setMarkerOnClick(map, thisMarker, markers, data[i], highlightIcon, normalIcon);
               
              thisMarker.index = i;
              markers.push(thisMarker);
          }
          setPrevNextOnClick(map, markers, data, highlightIcon, normalIcon);
          google.maps.event.trigger(markers[0], "click");
          return true;
        }
        
        
        function select(index, map, marker, markers, data, highlightIcon, normalIcon) {
            
            map.panTo(marker.getPosition());
            unsetMarkers(markers, normalIcon);
            loadWarehouseData(data);
            marker.setIcon(highlightIcon);

            function unsetMarkers(markers, normalIcon){
                var lim = markers.length;
                for (var i= 0;i<lim;i++){
                    markers[i].setIcon(normalIcon);
                }
            } 
        }
        
        //TODO : move this to select and add a call.
        function setMarkerOnClick(map, marker, markers, data, highlightIcon, normalIcon) {
            google.maps.event.addListener(marker, 'click', function() {
                selectedMarkerIndex = marker.index;
                select(marker.index, map, marker, markers, data, highlightIcon, normalIcon);
            }); 
        }
        
        function setPrevNextOnClick(map, IGNOREmrkers, data, highlightIcon, normalIcon) {
            $("#map-next-result").click(function() {
                selectedMarkerIndex++;
                selectedMarkerIndex = selectedMarkerIndex % ( markers.length );
                select(selectedMarkerIndex, map, markers[selectedMarkerIndex], markers, data[selectedMarkerIndex], highlightIcon, normalIcon)
            });
            $("#map-prev-result").click(function(){
                selectedMarkerIndex--;
                if (selectedMarkerIndex < 0) {
                    selectedMarkerIndex = markers.length - 1;
                }
                select(selectedMarkerIndex, map, markers[selectedMarkerIndex], markers, data[selectedMarkerIndex], highlightIcon, normalIcon)
            });
        }
        
        function loadWarehouseData(data) {
            if (!data){
                return;
            }
			if (data.photos[0] == undefined){
				data.photos[0] = 'not-found.jpg'//Default image
			}
            var resultsElem = $(RESULT_INFO_ELEM_SELECTOR);
            resultsElem.find('.js-name').html(data.name);
            resultsElem.find('.js-address').html(data.city + ", " + data.postcode );
            resultsElem.find('.js-name').html(data.name);
            resultsElem.find('.js-image').addClass("rotateY90");
            resultsElem.find('.add-to-quote').data("id", data._id);
            var milePluralOrSingle = data.distanceFromSearch == "1" || data.distanceFromSearch == 1 ? " mile" : " miles" ;
            resultsElem.find('.distance').html("<span class='miles'>" + data.distanceFromSearch + "</span>" + milePluralOrSingle + " from search");
            resultsElem.find('.remove-from-quote').data("id", data._id);
            resultsElem.find('.view-details').attr("href" , "/warehouse-profile/" + data._id + "?fromSearch=true");
            setTimeout(function(){resultsElem.find('.js-image').prop("src", "/images/" + data.photos[0]).removeClass("rotateY90");}, 300 );
        }

            initialize(postcode, radius);

        return {
            load:load,
            setRadius:setRadius
        }

    }
    
    return Class;
    
    
});