define(['async!https://maps.googleapis.com/maps/api/js' , "jquery", "loom/loomAlerts"], function (GM, $, Alerts) {

    //Apologies this is ugly.. could do with a rewrite.
    function Class(postcode, radius, $postCode) {
    
        var MAP_ELEM_ID = "map-container"
        var RESULT_INFO_ELEM_SELECTOR = "#search-results-info";
        var SEARCH_NAG_ELEM_SELECTOR = ".search-nag";
        var restrictions = {"country" : "UK"}; //https://developers.google.com/maps/documentation/geocoding/#ComponentFiltering
        var markers = []
        var selectedMarkerIndex =0;
        var map;
        var circle;
        var factoryData;
        var centerLatLong;
        var mapRadius;
        var $pcInput;
        var normalIcon = {
          url  : "/images/map-icon.png"
        }
        var highlightIcon = {
            url  : "/images/map-icon-highlight.png"
        }  
        var markerOptions;  
        
        function initialize(postcode, radius, $postCode) {
            
            var loc1 = new google.maps.LatLng(0,0);
            var mapOptions = {
                center: loc1,
                zoom: 14
            };
            map = new google.maps.Map( document.getElementById(MAP_ELEM_ID), mapOptions);
            centerMapAtPostCode(postcode, map, radius);
            changeMapRadiusOnClickEL();
            
            markerOptions = {
                icon: normalIcon,
                map:map,
                animation:'DROP'
            }
            
            if ($postCode.length > 0){
                $pcInput = $postCode;
            }
            
            mapRadius = radius;
            
            function changeMapRadiusOnClickEL(){
                google.maps.event.addListener(map, 'click', function(event) {
                    var $mapLockStatus = $(".change-map-lock-status");
                    if ($mapLockStatus.hasClass('lock-map')){
                        centerMapAtlnglat(event.latLng.lat(),event.latLng.lng(),map,mapRadius);
                        reverseGeocode(event.latLng.lat(),event.latLng.lng(),function(pc){
                            $pcInput.val(pc);
                            $(SEARCH_NAG_ELEM_SELECTOR).fadeIn();
                        });
                        $mapLockStatus.removeClass('lock-map');
                        $mapLockStatus.addClass('unlock-map');
                    }
                });
            }

            function centerMapAtPostCode(postcode, map, radius) {
                if (!radius) {
                  radius = 20;//default 20 miles;
                } //TODO: have a local API that we use for this.
                geocoder = new google.maps.Geocoder();
                geocoder.geocode( { 'address': postcode, "componentRestrictions":restrictions}, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                      if (results[0].partial_match === undefined){
                        var latlong = results[0].geometry.location;
                            var loc2 = new google.maps.LatLng(latlong.latitude, latlong.longitude);
                            centerLatLong = latlong;
                            map.setCenter(latlong);
                            setRadius(radius);
                            enableSearch();
                      }else if (results[0].partial_match == true){
                          Alerts.showErrorMessage("Postcode Not Found");
                          disableSearch('Please Enter a Valid Postcode to Complete a Search');
                      }
                    } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
                        Alerts.showErrorMessage("Postcode Not Found");
                        disableSearch('Please Enter a Valid Postcode to Complete a Search');
                    } else {
                      console.log('Geocode was not successful for the following reason: ' + status);
                      disableSearch('Geocode was not successful for the following reason: ' + status);
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
            var pixelHeight = $("#" + MAP_ELEM_ID).height();
            var shortestDimension = Math.min(pixelWidth, pixelHeight);
            var zoom = Math.round(Math.log(shortestDimension * 360 / angle / GLOBE_WIDTH) / Math.LN2);
            map.setZoom(zoom-2);
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
                map.setCenter(centerLatLong);
                mapRadius = radiusInMiles;
        }
        
        //deletes all the markers and reset the display area;
        function clear() {
            var lim = markers.length;
            for (var i = 0; i< lim; markers[i++].setMap(null));
            factoryData = {};
            markers = [];
            selectedMarkerIndex = 0;
            $('#search-results-info').fadeOut();  
        }
        
        function disableSearch(message){
            $('#search-form .input-field.last').addClass('invalid-postcode');
            $('#search-form .input-field.last button.action').hide();
            $('#search-form .input-field.last .search-nag').hide();
            $('#search-form .input-field.last p.invalid-postcode-message').html(message);
            $('#search-form .input-field.last p.invalid-postcode-message').show();
        }
        
        function enableSearch(){
            $('#search-form .input-field.last').removeClass('invalid-postcode');
            $('#search-form .input-field.last button.action').show();
            //$('#search-form .input-field.last .search-nag').show();
            $('#search-form .input-field.last p.invalid-postcode-message').html("");
            $('#search-form .input-field.last p.invalid-postcode-message').hide();   
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
            //highlight the row in the table.
            $("tr").removeClass("selected");
            $("#" + data._id).addClass("selected");
            function unsetMarkers(markers, normalIcon){
                var lim = markers.length;
                for (var i= 0;i<lim;i++){
                    markers[i].setIcon(normalIcon);
                }
            } 
        }
        
        function setMarkerOnClick(map, marker, markers, data, highlightIcon, normalIcon) {
            google.maps.event.addListener(marker, 'click', function() {
                selectedMarkerIndex = marker.index;
                select(marker.index, map, marker, markers, data, highlightIcon, normalIcon);
            }); 
        }
        
        function setPrevNextOnClick(map, markers, data, highlightIcon, normalIcon) {
            $("#map-next-result").unbind("click");
            $("#map-prev-result").unbind("click");
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
			// if (data.photos && data.photos[0] == undefined){
			// 	data.photos[0] = 'not-found.jpg'//Default image
			// }
            //var mainPhoto = data.defaultPhoto || data.photos[0] || "not-found.jpg";
            mainPhoto = data.defaultPhoto || "not-found.jpg";
            var postCodeFirstHalf = data.postcode.substr(0,2);//fallback if splitting on space fails.
            var postCodeSplit = data.postcode.split(" ");
            if (postCodeSplit.length > 1 && postCodeSplit[0].length > 1 && postCodeSplit.length <= 4) {
                postCodeFirstHalf = postCodeSplit[0];
            }
            
            var resultsElem = $(RESULT_INFO_ELEM_SELECTOR);
            resultsElem.find('.js-name').html(data.name);
            resultsElem.find('.js-address').html(data.city + ", " + postCodeFirstHalf );
            resultsElem.find('.js-name').html(data.name);
            resultsElem.find('.js-image').addClass("rotateY90");
            resultsElem.find('.add-to-quote').data("id", data._id);
            var milePluralOrSingle = data.distanceFromSearch == "1" || data.distanceFromSearch == 1 ? " mile" : " miles" ;
            resultsElem.find('.distance').html("<span class='miles'>" + data.distanceFromSearch + "</span>" + milePluralOrSingle + " from search");
            resultsElem.find('.remove-from-quote').data("id", data._id);
            resultsElem.find('.view-details').attr("href" , "/warehouse-profile/" + data._id + "?fromSearch=true");
            resultsElem.find(".js-size").html(data.size);
            resultsElem.find(".js-height").html(data.height);
            var $temps = resultsElem.find(".js-temperatures");
            resultsElem.find('.js-rating span').remove();
            if (data.rating){
                var j = 0;
                do{
                    resultsElem.find('.js-rating').append('<span class="ion-android-star rating"><em class="sr-only">*</em></span>');
                    j++;
                }
                while(j<data.rating)
            }else{
                resultsElem.find('.js-rating').append('<span>No Rating</span>');
            }
            $temps.html('');
            for (var i in data.storageTemps) {
                $temps.append("<span class='icon-box temp-" + data.storageTemps[i] +  "'></span>")
            }
            setTimeout(function(){resultsElem.find('.js-image').prop("src", "/images/warehouse-images/" + mainPhoto).removeClass("rotateY90");}, 300 );
        }

        function resizeMap(){
            var $result = $('#results-area');
            $result.find('.map-resize').on("mousedown",startResize);
            function startResize(){
                $(document).on("mousemove",function(event){
                    $('#map-container').height(event.pageY - $('#map-container').offset().top - $result.find('.footer').outerHeight() );
                    $('body').addClass('resize');
                });
                $(document).on("mouseup",function(){
                    google.maps.event.trigger(map, "resize");
                    $('body').removeClass('resize');
                    $(document).off("mousemove");
                });
            }  
        }

        function reverseGeocode(lat,lng,cb){
            var latLong = new google.maps.LatLng(lat, lng);
            geocoder = new google.maps.Geocoder();
            geocoder.geocode( { latLng: latLong, address: null}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    for (var i = 0; i < results[0].address_components.length; i++) {
                        if ((results[0].address_components[i].types[0] === "postal_code") || (results[0].address_components[i].types[1] === "postal_code")) {
                            cb(results[0].address_components[i].long_name);
                        }
                    }
                    
                } else if(status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT){
                    setTimeout(function(){
                        reverseGeocode(lat,lng,cb)
                        $(SEARCH_NAG_ELEM_SELECTOR).fadeIn();
                    }, 250);
                } else {
                    console.log('Geocode was not successful for the following reason: ' + status);
                }
            });
        }
        
        function centerMapAtlnglat(lat, lng, map, radius) {
            if (!radius) {
                radius = 20;//default 20 miles;
            } //TODO: have a local API that we use for this.
            var latlng = {lat: lat, lng: lng};
            var latlong = latlng;
            centerLatLong = latlong;
            map.setCenter(latlong);
            setRadius(radius);
        }

            initialize(postcode, radius, $postCode);

        return {
            load:load,
            setRadius:setRadius,
            enableSearch:enableSearch
        }

    }
    
    return Class;
    
    
});