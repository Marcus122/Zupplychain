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
			var $registration = $('#registration');
			$registration.on("submit",function(ev){
				ev.preventDefault();
				require(["loom/loom"], function (Loom) {
					var lm = new Loom(); 
					if( lm.isFormValid($registration.attr('id')) ){
						var warehouse={};
						bindFormToObject($registration,warehouse);
						updateWarehouse(warehouse)
					}
				});
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
	
	function bindFormToObject($form,object){
		var $inputs = $.merge( $form.find('input') , $form.find('textarea') );
		$form.find('input').each(function(){
			var $input = $(this);
			var name = $input.attr('name');
			var array = $input.data('array');
			if(array){
				if(!object[array]){
					object[array]=[];
				}
				var obj = {};
				if($input.val()){
					obj[name]=$input.val();
					if($input.attr('type') === 'checkbox'){
						obj.active = $input.is(':checked');
					}
					object[array].push(obj);
				}
			}else{
				if(name){
					object[name] = $input.val();
				}
			}
		});
	}
	function updateWarehouse(warehouse){
		var url = '/warehouse';
		if(warehouse.id) url+='/'+ warehouse.id;
		$.ajax({
			url: url,
			type:'POST',
			data: JSON.stringify(warehouse),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			success:function(){
				window.location = './provider-registration-2';
			}
		})
	}
    
    return Class;
    
    
});