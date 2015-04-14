define(['async!https://maps.googleapis.com/maps/api/js' , "jquery"], function (GM, $) {

    
    function Class(postcode, radius) {
    
        var MAP_ELEM_ID = "map-container"
        var RESULT_INFO_ELEM_SELECTOR = "#search-results-info";
        var markers = []
        var selectedMarkerIndex =0;
        var map;
        var circle;
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
          
          function centerMapAtPostCode(address, map, radius) {
              
              if (!radius) {
                  radius = 20;//default 20 miles;
              }
                geocoder = new google.maps.Geocoder();
              geocoder.geocode( { 'address': postcode}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                  
                  var latlong = results[0].geometry.location;
                    var loc2 = new google.maps.LatLng(latlong.latitude, latlong.longitude);
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
            //var west = sw.lng();
            //var east = ne.lng();
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
                center:map.getCenter(),
                radius: miles * 1609.344
                };
                // Add the circle for this city to the map.
                if (circle){
                    circle.setMap(null);
                }
                
                circle = new google.maps.Circle(radiusOptions);
            
        }
        
        function load(data) {
          var lim = data.length;
          for (var i =0;i<lim;i++) {
              var position = new google.maps.LatLng(data[i].latitude, data[i].longitude);
              
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
        
        function setPrevNextOnClick(map, markers, data, highlightIcon, normalIcon) {
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
            var resultsElem = $(RESULT_INFO_ELEM_SELECTOR);
            resultsElem.find('.js-name').html(data.name);
            resultsElem.find('.js-address').html(data.address);
            resultsElem.find('.js-name').html(data.name);
            resultsElem.find('.js-image').addClass("rotateY90");
            setTimeout(function(){resultsElem.find('.js-image').prop("src", data.imageURL).removeClass("rotateY90");}, 300 );
        }

            initialize(postcode, radius);

        return {
            load:load,
            setRadius:setRadius
        }

    }
    
    return Class;
    
    
});