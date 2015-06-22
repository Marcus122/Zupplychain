define(["jquery","loom/loom","templates/templates","loom/loomAlerts"], function ($,Loom,Templates,Alerts) {
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
        
        
		initialize();
    }
    return Class;
});

