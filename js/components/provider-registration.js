define(["jquery","controllers/warehouse"], function ($,Warehouse) {

    
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
						Warehouse.update(warehouse,function(){
							window.location = './provider-registration-2';
						});
					}
				});
			});
			var $defineSpace = $('#define-space');
			$defineSpace.on("submit",function(ev){
				ev.preventDefault();
				var storage=[];
				$defineSpace.find('tbody tr').each(function(){
					var s={};
					bindFormToObject($(this),s);
					storage.push(s);
				});
				var warehouse={};
				warehouse.id = $defineSpace.find('input[name="warehouse_id"]').val();
				Warehouse.updateStorageBatch(warehouse,storage,function(){
					window.location = './provider-registration-3';
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
		var $inputs = $.merge( $.merge( $form.find('input') , $form.find('textarea') ), $form.find('select') );
		$inputs.each(function(){
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
    
    return Class;
    
    
});