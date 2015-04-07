define(["jquery"], function ($) {

    
    function Class(data) {
		var templates;
		var storageNames=['A','B','C','D','E','F','G','H','I'];
		
		function initialize() {
			require(["templates/templates"], function(Templates){
				templates = new Templates();
			});
			$('.new-pallet button').on("click",function(ev){
					ev.preventDefault();
					addPallet();
			});
			$('.define-space').on("click",".trash-button",function(ev){
					ev.preventDefault();
					$(this).closest('tr').remove();
			});
			$('.define-space').on("click","tr",function(ev){
				ev.preventDefault();
				//$('.define-space .active').removeClass('active');
				$(this).toggleClass('active');
			});
			popups();
		}
		function addPallet(){
			$('.define-space .active').removeClass('active');
			var template = templates.getTemplate("define-space-row");
			var data={};
			data.name = storageNames[$('.define-space tbody tr').length];
			var $element = template.bind(data);
			$('.define-space tbody').append($element);
		}
		function popups(){
			$('.popup').on("click",function(){
				//Remove any old windows
				$('.popup-window').remove();
				var templateName = $(this).data('template');
				var template = templates.getTemplate(templateName);
				var $element = template.getElement();
				$('body').append($element);
			});
			$(document).on("click",".popup-window .close",function(){
				$('.popup-window').remove();
			});
		}
        $(function() {
            initialize();
        });

    }
    
    return Class;
    
    
});