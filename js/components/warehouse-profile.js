define(["jquery","loom/loom","templates/templates","loom/loomAlerts",'async!https://maps.googleapis.com/maps/api/js'], function ($,Loom,Templates,Alerts,GM) {
	/*SINGLETON*/
	
    function Class() {
		var templates = new Templates();
		var lm = new Loom();
		
		function initialize() {	
			$('.popup').on("click",function(){
                var id = $(this).data("id");
                $(".pricing-and-availability-" + id).slideToggle();
            });
            initAllAvailabilityBars();
            $('.see-on-map').on("hover",showMap);
		}
        function initAllAvailabilityBars(){
            var $theTables = $(".availability-table");
            $theTables.each(function() {
               initAvailabilityBars($(this));
            });
        }
        
        
        function initAvailabilityBars($theTable) {
            
            var maxValue = parseInt($theTable.data("max-availability"), 10); //the max value is what value a bar would need to have to be 100%;
            var $barTds = $theTable.find("td.bar");
            var barWidth = $barTds.width();
            $barTds.each(function() {
                var thisBar = $(this).find("div.bar.not-full");
                var thisValue = parseInt(thisBar.data("value"),10);
                if (!isNaN(thisValue)){
                    thisBar.css("width", (barWidth / maxValue )  * thisValue);
                }
            });
            
            var $theMarker = $theTable.closest(".main").find(".availability-marker");
            var markerValue = parseInt($theMarker.find(".number").text(), 10);
            var markerRight = barWidth - (barWidth /maxValue) * markerValue;
            $theMarker.css("right", markerRight);       
            
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

