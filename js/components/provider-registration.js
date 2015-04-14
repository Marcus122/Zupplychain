define(["jquery","controllers/warehouse"], function ($,Warehouse) {

    
    function Class(data) {
		var templates;
		var storageNames=['A','B','C','D','E','F','G','H','I'];
		var storage=[];
		
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
				var id = $(this).closest('tr').data('id');
				$('.popup-window').remove();
				var templateName = $(this).data('template');
				var template = templates.getTemplate(templateName);
				var $element = template.getElement();
				getStorage(id,function(Storage){
					$('body').append($element);
					switch( templateName ){
						case 'pricing':
							doPricing(Storage,$element);
							break;
						case 'pallets':
							doPallets(Storage,$element);
							break;
						case 'volume':
							doDiscount(Storage,$element);
							break;
						
					}
				});
			});
			$(document).on("click",".popup-window .close",function(){
				closePopup();
			});
		}
		function getStorage(id,cb){
			if( storage[id] ){
				cb(storage[id])
			}else{
				Warehouse.getStorage(id,function(Storage){
					storage[id] = Storage.data;
					cb(storage[id]);
				});
			}
		}
		function closePopup(){
			$('.popup-window').remove();
		}
		function doPricing(_Storage,$element){
			var template = templates.getTemplate("pricing-row");
			var Storage = _Storage;
			if(!Storage.pricing || !Storage.pricing.length){
				var $row = template.getElement();
				$element.find('table').append($row);
			}else{
				for(i in Storage.pricing){
					Storage.pricing[i].from = new Date(Storage.pricing[i].from).toISOString().substring(0, 10);
					Storage.pricing[i].to = new Date(Storage.pricing[i].to).toISOString().substring(0, 10);
					var $row = template.bind( Storage.pricing[i] );
					$element.find('tbody').append($row);
				}
			}
			$element.find('.add').on("click",function(){
				var $newrow = template.getElement();
				$element.find('tbody').append($newrow);
			});
			$element.find('.done').on("click",function(){
				Storage.pricing=[];
				$element.find('tbody tr').each(function(){
					var price={};
					bindFormToObject($(this),price);
					price.from = new Date(price.from).toISOString();
					price.to = new Date(price.to).toISOString();
					Storage.pricing.push(price);
				});
				closePopup();
			});
			$element.on('click','.trash-button',function(){
				$(this).closest('tr').remove();
			});
		}
		function doPallets(_Storage,$element){
			var template = templates.getTemplate("pallet-row");
			var Storage = _Storage;
			if(!Storage.pallets || !Storage.pallets.length){
				addPalletRow();
			}else{
				for(i in Storage.pallets){
					Storage.pallets[i].from = new Date(Storage.pallets[i].from).toISOString().substring(0, 10);
					Storage.pallets[i].to = new Date(Storage.pallets[i].to).toISOString().substring(0, 10);
					addPalletRow( Storage.pallets[i] );
				}
			}
			$element.find('.add').on("click",function(){
				addPalletRow();
			});
			$element.find('.done').on("click",function(){
				Storage.pallets=[];
				$element.find('tbody tr').each(function(){
					var pallet={};
					bindFormToObject($(this),pallet);
					pallet.from = new Date(pallet.from).toISOString();
					pallet.to = new Date(pallet.to).toISOString();
					Storage.pallets.push(pallet);
				});
				closePopup();
			});
			$element.on('click','.trash-button',function(){
				$(this).closest('tr').remove();
			});
			function addPalletRow(_data){
				var data = _data || {};
				if(!_data){
					data.total = Storage.palletSpaces;
					data.inUse = 0;
					data.free = data.total;
				}
				var $row = template.bind( data );
				$element.find('tbody').append($row);
			}
		}
		function doDiscount(_Storage,$element){
			var template = templates.getTemplate("discount-row");
			var Storage = _Storage;
			if(!Storage.discounts || !Storage.discounts.length){
				addDiscountRow();
			}else{
				for(i in Storage.discounts){
					addDiscountRow( Storage.discounts[i] );
				}
			}
			$element.find('.add').on("click",function(){
				addDiscountRow();
			});
			$element.find('.done').on("click",function(){
				Storage.discounts=toArray();
				closePopup();
			});
			$element.on('click','.trash-button',function(){
				$(this).closest('tr').remove();
			});
			function addDiscountRow(_data){
				var data = _data || {};
				if(!_data){
					data.from = 1;
					data.value = 0;
					var arr = toArray();
					if(arr.length){
						data.from=Number(arr[arr.length-1].to )+1;
					}
				}
				var $row = template.bind( data );
				$element.find('tbody').append($row);
			}
			function toArray(){
				var array=[];
				$element.find('tbody tr').each(function(){
					var discount={};
					bindFormToObject($(this),discount);
					array.push(discount);
				});
				return array;
			}
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