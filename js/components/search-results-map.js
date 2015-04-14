define(['async!https://maps.googleapis.com/maps/api/js' , "jquery"], function (GM, $) {

    
    function Class() {
    
        var MAP_ELEM_ID = "map-container"
        var RESULT_INFO_ELEM_SELECTOR = "#search-results-info";
        var markers = []
        var selectedMarkerIndex =0;
        var map;
        var normalIcon = {
              url  : "/images/map-icon.png"
          }
          
          var highlightIcon = {
            url  : "/images/map-icon-highlight.png"
          }
          
          var markerOptions;
          
          
          
        
        function initialize() {
          //var loc1 = new google.maps.LatLng(data[0].latitude, data[0].longitude);
          var mapOptions = {
            //center: loc1,
            zoom: 14
          };
          map = new google.maps.Map( document.getElementById(MAP_ELEM_ID), mapOptions);
          
          markerOptions = {
              icon: normalIcon,
              map:map,
              animation:'DROP'
          }

          
          
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

        $(function() {
            initialize();
        });
        return {
            load:load
        }

    }
    
    return Class;
    
    
});