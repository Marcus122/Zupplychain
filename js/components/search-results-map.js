define(['async!https://maps.googleapis.com/maps/api/js' , "jquery"], function (GM, $) {

    
    function Class(data) {
    
        var MAP_ELEM_ID = "map-container"
        var RESULT_INFO_ELEM_SELECTOR = "#search-results-info";
        var markers = []
        var selectedMarkerIndex;
        
        function initialize() {
          var loc1 = new google.maps.LatLng(data[0].latitude, data[0].longitude);
          var mapOptions = {
            center: loc1,
            zoom: 14
          };
          var map = new google.maps.Map( document.getElementById(MAP_ELEM_ID), mapOptions);
          
          var normalIcon = {
              url  : "/images/map-icon.png"
          }
          
          var highlightIcon = {
            url  : "/images/map-icon-highlight.png"
          }
          
          
          var markerOptions = {
              icon: normalIcon,
              map:map,
              animation:'DROP'
          }

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
                select(marker.index, map, marker, markers, data, highlightIcon, normalIcon);
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

        $(function() {
            initialize();
        });

    }
    
    return Class;
    
    
});