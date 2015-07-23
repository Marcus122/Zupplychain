"use strict";
define(["jquery","loom/loom","templates/templates","loom/loomAlerts",'async!https://maps.googleapis.com/maps/api/js'], function ($,Loom,Templates,Alerts,GM) {
	
    function Class() {
		var templates = new Templates();
		var lm = new Loom();
		
		function initialize() {	
			$('.popup').on("click",function(){
                $(this).toggleClass("show").toggleClass("hide");
                var id = $(this).data("id");
                $(".pricing-and-availability-" + id).toggle();
            });
            initAllAvailabilityBars();
            initUseageProfileChange()
            $('.see-on-map').on("mouseover",showMap);

            
            //world's simplest image gallery :)
            $(".thumbnails img").click( function(evt) {
                $(".placeholder").attr("src", $(this).attr("src"));
            });
            
		}
        
        function initAllAvailabilityBars(){
            var $theTables = $(".warehouse-pricing table");
            $theTables.each(function() {
               initAvailabilityBars($(this));
            });
            
            $(document).on("click", ".bar-container .bar", function(evt) {
                //get the offset from the bar's left;
                var mouseX = evt.pageX;
                var divX = $(evt.target).offset().left;
                var leftOffset = mouseX - divX;
                var maxPossibleOffset = $(evt.target).width();
                //convert the offset relative to the maxPallets (100% bar width);
                var ratio = leftOffset / maxPossibleOffset;
                var maxPallets = $(evt.target).closest("table").data("max-pallets");
                var selectedValue = Math.round(ratio * maxPallets);
                var $tr = $(evt.target).closest("tr");
                var $useageMarker = $tr.find(".useage-marker");
                $useageMarker.data("palletsRequired", selectedValue);
                $tr.find("input").val(selectedValue);
                var $theTable = $(".warehouse-pricing table");
                $tr.find("input").trigger("change");
            });
            
        }
        
        
        function initAvailabilityBars($theTable) {
            var maxValue = parseInt($theTable.data("max-pallets"), 10); //the max value is what value a bar would need to have to be 100%;
            var $barTds = $theTable.find("td.bar-container");
            var barWidth = $barTds.width();
            var runningTotal = 0;
            $barTds.each(function() {
                var thisBar = $(this).find(".bar");
                var baseLeft = thisBar.offset().left - $barTds.offset().left;
                var thisValue = parseInt(thisBar.data("value"),10);
                if (!isNaN(thisValue) && thisBar.is(".not-full")){
                    thisBar.css("width", (barWidth / maxValue)  * thisValue);
                }
                var $theMarker = thisBar.closest("tr").find(".useage-marker");
                var markerValue = parseInt($theMarker.data("pallets-required"), 10);
                var markerLeft = (barWidth /maxValue) * markerValue + baseLeft;
                $theMarker.css("left", markerLeft);
            });
        }
        
        var focussedInputWCdate;
        
        function initUseageProfileChange() {
            $(document).on("change", ".warehouse-pricing table input",function(evt){
                focussedInputWCdate = $(this).closest("tr").next().find(".week-commencing").data("week-commencing");
                var wcDate = $(this).closest("tr").data("week-commencing");
                var newNum = parseInt($(this).val());
                if (isNaN(newNum)) {
                    return;
                }
                var warehouseId = $("#warehouse-id").val();
                var numPallets = $(this).val();
                var wcDate = $(this).closest("tr").find(".week-commencing").data("week-commencing");
                // we chuck up the ajax request to get the result for this row back from the server.
                $.post("/useage-profile",
                        {
                            wcDate :  wcDate,
                            numPallets : numPallets,
                            "warehouse-id" : warehouseId
                        },
                        function (result) {
                            populatePricingTable(result, wcDate);
                });
            });
            
        }
        
        function populatePricingTable(storageProfile, wcDateOfRowThatChanged) {
            var newLargestRequiredValue = 0;
            var $theTable = $(".warehouse-pricing table");
            var runningTotal = 0.0;
            var template = templates.getTemplate("warehouse-pricing-row");
            for (var wcDateString in storageProfile) {
                var rowObject = {}
                var sp = storageProfile[wcDateString];
                rowObject["wcDate"] = wcDateString;
                rowObject["palletsRequired"] = sp.numPallets;
                newLargestRequiredValue = Math.max(newLargestRequiredValue, sp.numPallets);
                rowObject["numPalletsStored"] = sp.numPalletsStored;
                var fits = rowObject["palletsRequired"] <= rowObject["numPalletsStored"];
                var extraCSSClass = fits ? "full " : "not-full ";
                rowObject["barText"] = fits ? "OK" : rowObject["numPalletsStored"];
                rowObject["cssClass"] = "bar " + extraCSSClass;
                rowObject["price"] = Number(sp.highestPriceOfAnyStorageUsed.price).toFixed(2);
                rowObject["charge"] = Number(sp.highestPriceOfAnyStorageUsed.charge).toFixed(2);
                runningTotal = rowObject["price"] * sp.numPallets;
                var $tr = $(".warehouse-pricing table").find("td[data-week-commencing='" + wcDateString + "']").closest('tr');
                var row = template.bind(rowObject);
                if (wcDateOfRowThatChanged == wcDateString) {
                    row.addClass("animated");
                }
                row.insertAfter($tr);
                $tr.remove();
            }
            $theTable.data("max-pallets", Math.round(newLargestRequiredValue * 1.5));
            $("#estimated-total-cost .price").html(runningTotal.toFixed(2));
            initAvailabilityBars($theTable);
            console.log("setting Timeout");
            setTimeout(function(){
                    $theTable.find("td[data-week-commencing='" + focussedInputWCdate+  "']").closest("tr").find("input").focus(); 
                }, 100);
        }
        
        function showMap(){
            var $map = $('#profile-map');
            var highlightIcon = { url  : "/images/map-icon-highlight.png" };
            if(!$map.hasClass('loaded')){
                var loc1 = new google.maps.LatLng($map.data('lat'),$map.data('lng'));
                var mapOptions = {
                    center: loc1,
                    zoom: 14
                };
                var map = new google.maps.Map( $map[0], mapOptions);
                
                var markerOptions = {
                    icon: highlightIcon,
                    map:map,
                    position:loc1,
                    animation:'DROP'
                };
                var thisMarker = new google.maps.Marker(markerOptions);
                $map.addClass('loaded');
            }
        }
        
        
		initialize();
    }
    return Class;
});

