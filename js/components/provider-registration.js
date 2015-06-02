define(["jquery","controllers/warehouse","loom/loom","templates/templates"], function ($,Warehouse,Loom,Templates) {
	/*SINGLETON*/
	
    function Class(data) {
		var templates = new Templates();
		var storageNames=['A','B','C','D','E','F','G','H','I'];
		var storage=[];
		var warehouse={};
		var lm = new Loom();
		
		function initialize() {
			$('.new-pallet button').on("click",function(ev){
				ev.preventDefault();
				addPallet();
			});
			var $addPhoto = $('#add-photo');
			var $uploadPhoto = $('#photos');
			var $photoArea = $('#upload-photos');
			$addPhoto.on("click",function(ev){
				ev.preventDefault();
				var files=$uploadPhoto.prop("files");
				if(!files) return;
				sendFile(files,function(data){
					if(!warehouse.photos) warehouse.photos=[];
					var template = templates.getTemplate("warehouse-image");
					for( i in data){
						var image = data[i];
						image.file = '/images/' + data[i].name;
						var $image = template.bind( image );
						$photoArea.append($image);
						$uploadPhoto.val("");
					}
				});
			});
			$photoArea.on("click",".trash-button",function(ev){
				ev.preventDefault();
				$(this).closest('.document').remove();
			});
			var $defineSpace = $('.define-space');
			$defineSpace.on("click",".trash-button",function(ev){
				ev.preventDefault();
				$(this).closest('tr').remove();
			});
			$defineSpace.on("click","tr",function(ev){
				ev.preventDefault();
				$(this).toggleClass('active');
			});
			$("form#define-space").on("click",".reg-2-example",function(ev){
				ev.preventDefault();
				var $form = $(this).closest('form');
				var form = lm.getForm($form.attr("id"));
				var formLim = $form.find('table').find('tbody').find('tr').length;
				for (i = 0; i < formLim; i++){
					$($form.find('table').find('tbody').find('tr')[i].children[0]).find('input[name="name"]').val(storageNames[i]);
					$($form.find('table').find('tbody').find('tr')[i].children[3]).find('input[name="maxWeight"]').val(100);
					$($form.find('table').find('tbody').find('tr')[i].children[4]).find('input[name="maxHeight"]').val(100);
					$($form.find('table').find('tbody').find('tr')[i].children[5]).find('input[name="palletSpaces"]').val(100);
				}
			});
			var $registration = $('#registration');
			$registration.on("submit",function(ev){
				ev.preventDefault();
				saveWarehouse(function(){
					window.location = './provider-registration-2';
				});
			});
			$registration.find('.save').on("click",function(ev){
				saveWarehouse();
			});
			function saveWarehouse(cb){
				if( lm.isFormValid($registration.attr('id')) ){
					bindFormToObject($registration,warehouse);
					Warehouse.update(warehouse,function(){
						if(cb) cb();
					});
				}
			}
			var $defineSpace = $('#define-space');
			$defineSpace.on("submit",function(ev){
				ev.preventDefault();
				saveDefinedSpace(function(){
					window.location = './provider-registration-3';
				});
			});
			$defineSpace.find('.save').on("click",function(ev){
				ev.preventDefault();
				saveDefinedSpace();
			});
			function saveDefinedSpace(cb){
				if( lm.isFormValid($defineSpace.attr('id')) ){
					var storage=[];
					$defineSpace.find('tbody tr').each(function(){
						var s={};
						bindFormToObject($(this),s);
						storage.push(s);
					});
					var warehouse={};
					warehouse.id = $defineSpace.find('input[name="warehouse_id"]').val();
					Warehouse.updateStorageBatch(warehouse,storage,function(){
						if(cb) cb();
					});
				}
			}
			var $priceForm = $('#price-and-availability-user-data');
			$priceForm.on("submit",function(ev){
				ev.preventDefault();
				//Check each storage has pricing
				var complete=true;
				$priceForm.find('tbody tr').each(function(){
					var $tr=$(this);
					var Storage = storage[$tr.data('id')];
					if(!Storage || !Storage.pricing.length){
						$tr.find('.pricing').addClass('error');
						complete=false;
					}else{
						$tr.find('.pricing').removeClass('error');
					}
				});
				if(complete && lm.isFormValid($priceForm.attr('id')) ){
					warehouse.id=$priceForm.find('input[name="warehouse"]').val();
					var s=[];
					for(i in storage){
						s.push(storage[i]);
					}
					Warehouse.updateStorageBatch(warehouse,s,function(){
						$.ajax({
							url: '/complete-registration',
							type: 'POST',
							data: { name : $('input[name="name"]').val(),
									contact : $('input[name="contact"]').val(),
									email : $('input[name="email"]').val(),
									password : $('input[name="password"]').val(),
									confirm : $('input[name="confirm-password"]').val()	},
							cache: false,
							success: function(data){
								if (typeof data.redirect == 'string'){
									window.location = data.redirect;
								}
							}
						})
					});
				}
			});
			$(document).on("pricing-success",function(ev,id){
				$priceForm.find('tbody tr').each(function(){
					var $tr = $(this);
					if( $tr.data('id') === id ){
						$tr.find('.pricing').addClass('success');
						return true;
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
					lm.rebind($element.find('form'));
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
			var $form = $element.find('form');
			var storageName;
			if (Storage){
				storageName = Storage.name;
				if (storageName != 'undefined'){
					$element.find('.close').before("<h2> Storage Name: " + storageName + "</h2>");
				}
			}
			if(!Storage.pricing || !Storage.pricing.length){
				var data={};
				var from = new Date(),
					to = new Date();
				to.setDate(from.getDate() + 364);
				data.from = from.toISOString().substring(0, 10);
				data.to = to.toISOString().substring(0, 10);
				addPricingRow(data);
			}else{
				for(i in Storage.pricing){
					Storage.pricing[i].from = new Date(Storage.pricing[i].from).toISOString().substring(0, 10);
					Storage.pricing[i].to = new Date(Storage.pricing[i].to).toISOString().substring(0, 10);
					var $row = template.bind( Storage.pricing[i] );
					$element.find('tbody').append($row);
				}
			}
			$element.find('.add').on("click",function(){
				if( lm.isFormValid($(this).closest('form').attr('id')) ){
					addPricingRow();
					lm.rebind($form);
				}
			});
			$form.on("submit",function(ev){
				ev.preventDefault();
				if( lm.isFormValid($(this).closest('form').attr('id')) ){
					Storage.pricing=toArray();
					$(document).trigger("pricing-success",Storage._id);
					closePopup();
				}
			});
			$element.on('click','.trash-button',function(){
				$(this).closest('tr').remove();
				lm.rebind($form);
			});
			function addPricingRow(_data){
				var data = _data || {};
				if(!_data){
					var arr = toArray();
					if(arr.length){
						var date = new Date(arr[arr.length-1].to);
						date.setDate(date.getDate()+1);
						data.from = date.toISOString().substring(0, 10)
					}
				}
				var $newrow = template.bind(data);
				$element.find('tbody').append($newrow);
			}
			function toArray(){
				var array=[];
				$element.find('tbody tr').each(function(){
					var price={};
					bindFormToObject($(this),price);
					price.from = new Date(price.from).toISOString();
					price.to = new Date(price.to).toISOString();
					array.push(price);
				});
				return array;
			}
		}
		function doPallets(_Storage,$element){
			var template = templates.getTemplate("pallet-row");
			var Storage = _Storage;
			var $form = $element.find('form');
			if (Storage){
				storageName = Storage.name;
				if (storageName != 'undefined'){
					$element.find('.close').before("<h2> Storage Name: " + storageName + "</h2>");
				}
			}
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
				if( lm.isFormValid($form.attr('id')) ){
					addPalletRow();
					lm.rebind($form);
				}
			});
			$form.on("submit",function(ev){
				ev.preventDefault();
				if( lm.isFormValid($form.attr('id')) ){
					Storage.pallets=toArray();
					closePopup();
				}
			});
			$element.on('click','.trash-button',function(){
				$(this).closest('tr').remove();
				lm.rebind($form);
			});
			function addPalletRow(_data){
				var data = _data || {};
				if(!_data){
					data.total = Storage.palletSpaces;
					data.inUse = 0;
					data.free = data.total;
					var arr = toArray();
					if(arr.length){
						var date = new Date(arr[arr.length-1].to);
						date.setDate(date.getDate()+1);
						data.from = date.toISOString().substring(0, 10);
						var dateTo = new Date(data.from);
						if ((dateTo.getFullYear()+1) % 4 == 0){
							dateTo.setDate(dateTo.getDate()+366);
						}else{
							dateTo.setDate(dateTo.getDate()+365);
						}
						data.to = dateTo.toISOString().substring(0, 10);
					}
				}
				var $row = template.bind( data );
				$element.find('tbody').append($row);
			}
			function toArray(){
				var array=[];
				$element.find('tbody tr').each(function(){
					var pallet={};
					bindFormToObject($(this),pallet);
					pallet.from = new Date(pallet.from).toISOString();
					pallet.to = new Date(pallet.to).toISOString();
					array.push(pallet);
				});
				return array;
			}
			function rebind(){
				$form.find('input[name="inUse"]').off("change").on("change",function(){
					var $tr = $(this).closest('tr');
					var obj={};
					bindFormToObject($tr,obj);
					obj.free=obj.total-obj.inUse;
					var $row = template.bind( obj );
					$tr.replaceWith($row);
					rebind();
				});
				lm.rebind($form);
			}
		}
		function doDiscount(_Storage,$element){
			var template = templates.getTemplate("discount-row");
			var Storage = _Storage;
			var $form = $element.find('form');
			if (Storage){
				storageName = Storage.name;
				if (storageName != 'undefined'){
					$element.find('.close').before("<h2> Storage Name: " + storageName + "</h2>");
				}
			}
			if(!Storage.discounts || !Storage.discounts.length){
				addDiscountRow();
			}else{
				for(i in Storage.discounts){
					addDiscountRow( Storage.discounts[i] );
				}
			}
			$element.find('.add').on("click",function(){
				if( lm.isFormValid($form.attr('id')) ){
					addDiscountRow();
					lm.rebind($form);
				}
			});
			$form.on("submit",function(ev){
				ev.preventDefault();
				if( lm.isFormValid($form.attr('id')) ){
					Storage.discounts=toArray();
					closePopup();
				}
			});
			$element.on('click','.trash-button',function(){
				$(this).closest('tr').remove();
				lm.rebind($form);
			});
			function addDiscountRow(_data){
				var data = _data || {};
				if(!_data){
					data.from = 1;
					data.value = 0;
					var arr = toArray();
					if(arr.length){
						data.from=Number(arr[arr.length-1].to )+1;
						data.to=9999;
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
				if($input.attr('type') === 'checkbox'){
					if($input.is(':checked')){
						object[array].push($input.attr('value'));
					}
				}else{
					object[array].push($input.val());
				}
			}else{
				if(name){
					object[name] = $input.val();
				}
			}
		});
	}
	
	function sendFile(files,cb){
		if(!files) return cb();
		var data = new FormData();
		$.each(files, function(key, value)
		{
			data.append(key, value);
		});
		$.ajax({
			url: '/registration/upload',
			type: 'POST',
			data: data,
			cache: false,
			dataType: 'json',
			processData: false, // Don't process the files
			contentType: false, // Set content type to false as jQuery will tell the server its a query string request
			success: function(data){
				cb(data);
			},
			error: function(){
				cb();
			}
		})
	}
	
    return Class;
    
    
});