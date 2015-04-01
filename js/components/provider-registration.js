define(['async!https://maps.googleapis.com/maps/api/js' , "jquery"], function (GM, $) {

    
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
		}
		function addPallet(){
			$('.define-space .active').removeClass('active');
			var template = templates.getTemplate("define-space-row");
			var data={};
			data.name = storageNames[$('.define-space tbody tr').length];
			var $element = template.bind(data);
			var $tr = $('<tr/>').append($element);
			$('.define-space tbody').append($tr);
		}

        $(function() {
            initialize();
        });

    }
    
    return Class;
    
    
});