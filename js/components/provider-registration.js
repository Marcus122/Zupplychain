define(['async!https://maps.googleapis.com/maps/api/js' , "jquery"], function (GM, $) {

    
    function Class(data) {
		function initialize() {
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
			var $tr = $('.define-space tbody tr').first().clone();
			$tr.find('input').each(function(){
				$(this).val("");
			});
			$('.define-space tbody').append($tr.addClass('active'));
		}

        $(function() {
            initialize();
        });

    }
    
    return Class;
    
    
});