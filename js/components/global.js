define(["jquery","loom/loom","loom/loomAlerts","templates/templates"], function ($,Loom,Alerts,Templates) {
	
    function Class() {
		var templates = new Templates();
		
		function show403Popup(){
			var template = templates.getTemplate('403-popup');
			var $popup = template.bind({});
			$('body').append($popup);
			centerPopup($popup);
			
		}
		
		function centerPopup($element){
			var top;
			var $window = $(window);
			var diff = $window.height() - $element.height();
			var top = diff < 0 ? $window.scrollTop() + 25 : $window.scrollTop() + diff/2;
			//var top = (screen.height/2) - (window.screen.availHeight/2);
			if(top > 100){
				top-=50;
			}					
			$element.css({
				top:top
			});
		}
		
		return {
			show403Popup:show403Popup,
			centerPopup:centerPopup
		}
	}
	
	return Class;
	
});