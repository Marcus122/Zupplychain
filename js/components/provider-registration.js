define(["jquery","controllers/warehouse","loom/loom","templates/templates","loom/loomAlerts"], function ($,Warehouse,Loom,Templates,Alerts) {
	/*SINGLETON*/
	
    function Class(data) {
		var templates = new Templates();
		var storageNames=['A','B','C','D','E','F','G','H','I'];
		var storage=[];
		var warehouse={};
		var lm = new Loom();
		var data={};
		
		function initialize() {
			step1();
			step2();
			step3();
			
			$(document).on("click",".popup-window .close",function(){
				closePopup();
			});
			
		}
		function toPrice(num){
			return Number(num).toFixed(2);
		}
		function centerPopup($element){
			var top;
			var $window = $(window);
			var diff = $window.height() - $element.height();
			var top = diff < 0 ? $window.scrollTop() + 25 : $window.scrollTop() + diff/2;
			if(top > 100){
				top-=50;
			}					
			$element.css({
				top:top
			});
		}
		function closePopup(){
			$('.popup-window').remove();
		}
		
		function dateRanges(){
			$(document).on('blur','table input[type="date"]',function(){
				var $form = $(this).closest('form');
				//if(lm.isFormValid($form.attr('id'))){
					$form.find('table').each(function(){
						sortDateMaxMin($(this));
					});
					lm.rebind($form);
				//}
			});
		}
		function nextRow($tbody,index,min){
			var $row = $tbody.find('tr').eq(index);
			var $from = $row.find('input[name="from"]');
			var $to = $row.find('input[name="to"]');
			if(!$from.length || !$to.length) return;
			if(min){
				$from.attr('min',min);
			}
			$from.attr('max',$to.val());
			$to.attr('min',$from.val());
			if($row.index() != $row.closest('tbody').find('tr').length-1){
				nextRow($tbody,index+1,$to.val());
			}
		}
		function sortDateMaxMin($table){
			nextRow($table.find('tbody'),0);
		}
		function saveRegistration(){
			var saveTemplate = templates.getTemplate("save-registration");
			var $popup = saveTemplate.bind(data);
			$('body').append($popup);
			centerPopup($popup);
			var $form = $popup.find('form');
			lm.rebind($form);
			var form = lm.getForm($form.attr('id'));
			form.addOnSuccessCallback(function(){
				data.registered=true;
				closePopup();
			});
		}
		function completeRegistration(){
			var completeTemplate = templates.getTemplate("complete-registration");
			if(!completeTemplate) return;
			var $popup = completeTemplate.getElement();
			$('body').append($popup);
			centerPopup($popup);
			var $form = $popup.find('form');
			lm.rebind($form);
			var form = lm.getForm($form.attr('id'));
			form.addOnSuccessCallback(function(data){
				if (typeof data.redirect == 'string'){
					window.location = data.redirect;
				}else{
					closePopup();
				}
			});
		}
		function rebindForm(){
			$('.loom-form').each(function(){
				var $form = $(this);
				lm.rebind($form);
			});
		}
		function step1(){
			var $registration = $('#registration');
			if(!$registration.length) return;
			$registration.on("submit",function(ev){
				ev.preventDefault();
				saveWarehouse(function(result){
					if (result.data.geo.lat !== null && result.data.geo.lng !== null){
						window.location = $registration.attr('action');
					} else {
						Alerts.showErrorMessage("Postcode Not Found");
					}
				});
			});
			$registration.find('.save').on("click",function(ev){
				saveWarehouse();
				saveRegistration();
			});
			function saveWarehouse(cb){
				if( lm.isFormValid($registration.attr('id')) ){
					bindFormToObject($registration,warehouse);
					Warehouse.update(warehouse,function(result){
						if(cb) cb(result);
					});
				}
			}
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
		}
		function step2(){
			var $defineSpaceTable = $('.define-space');
			var $defineSpace = $('#define-space');
			if(!$defineSpace.length) return;
			$('.new-pallet button').on("click",function(ev){
				ev.preventDefault();
				addPallet();
				removeButtons();
			});
			$defineSpaceTable.on("click",".trash-button",function(ev){
				ev.preventDefault();
				$(this).closest('tr').remove();
				rebindForm();
				removeButtons();
			});
			$defineSpaceTable.on("click","tr",function(ev){
				ev.preventDefault();
				$(this).toggleClass('active');
			});
			/*$defineSpace.find(".reg-2-example").on("click",function(ev){
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
			});*/
			$defineSpace.on("submit",function(ev){
				ev.preventDefault();
				saveDefinedSpace(function(){
					window.location = $defineSpace.attr('action');
				});
			});
			$defineSpace.find('.save').on("click",function(ev){
				ev.preventDefault();
				if( lm.isFormValid($defineSpace.attr('id')) ){
					saveDefinedSpace();
					saveRegistration();
				}
			});
			function saveDefinedSpace(cb){
				if( lm.isFormValid($defineSpace.attr('id')) ){
					var storage=[];
					$defineSpaceTable.find('tbody tr').each(function(){
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
			function removeButtons(){
				if($defineSpaceTable.find('tbody tr').length === 1){
					$defineSpaceTable.find('.trash-button').addClass('hidden');
				}else{
					$defineSpaceTable.find('.trash-button').removeClass('hidden');
				}
			}
			function addPallet(){
				$('.define-space .active').removeClass('active');
				var template = templates.getTemplate("define-space-row");
				var data={};
				data.placeholder = storageNames[$('.define-space tbody tr').length];
				var $element = template.bind(data);
				$('.define-space tbody').append($element);
				rebindForm();
			}
		}
		function step3(){
			var $priceForm = $('#price-and-availability-user-data');
			if(!$priceForm.length) return;
			$priceForm.on("submit",function(ev){
				ev.preventDefault();
				//Check each storage has pricing
				var complete=true;
				$priceForm.find('tbody tr').each(function(){
					var $tr=$(this);
					var Storage = storage[$tr.data('id')];
					if(!Storage || !Storage.basicPricing.price){
						$tr.find('.pricing').addClass('error');
						complete=false;
					}else{
						$tr.find('.pricing').removeClass('error');
					}
					
					if(!Storage || !(Storage.discounts.length || Storage.noDiscount)){
						$tr.find('.discounts').addClass('error');
						complete=false;
					}else{
						$tr.find('.discounts').removeClass('error');
					}
					
					if(!Storage || !Storage.pallets.length){
						$tr.find('.pallets').addClass('error');
						complete=false;
					}else{
						$tr.find('.pallets').removeClass('error');
					}
				});
				if(complete && lm.isFormValid($priceForm.attr('id')) ){
					saveStorage(completeRegistration);
				}
			});
			$(document).on("popup-form-success",function(ev,id){
				updateStorage(id);
				var formId = $(ev.target.activeElement).closest('form').attr('id');
				$priceForm.find('tbody tr').each(function(){
					var $tr = $(this);
					if( $tr.data('id') === id ){
						switch(formId){
							case 'pricing-form':
								$tr.find('.pricing').addClass('success');
								break;
							case 'discount-form':
								$tr.find('.discounts').addClass('success');
								break;
							case 'pallets-form':
								$tr.find('.pallets').addClass('success');
								break;
							default:
								return false;
						}
						var progress=0;
						if($tr.find('.pricing').hasClass('success')){
							progress++;
						}
						if($tr.find('.discounts').hasClass('success')){
							progress++;
						}
						if($tr.find('.pallets').hasClass('success')){
							progress++;
						}
						$tr.find('.progress').removeClass(function(i,c){
							return c.indexOf("fill-") > -1;
						}).addClass("fill-"+String(progress));
						return true;
					}
				});
			});
			dateRanges();
			popups();
			function updateStorage(id){
				if(storage[id]){
					warehouse.id=$priceForm.find('input[name="warehouse"]').val();
					Warehouse.updateStorage(warehouse,storage[id]);
				}
			}
			function saveStorage(cb){
				warehouse.id=$priceForm.find('input[name="warehouse"]').val();
				var s=[];
				for(i in storage){
					s.push(storage[i]);
				}
				Warehouse.updateStorageBatch(warehouse,s,function(){
					if(cb) cb();
				});
			}
			function popups(){
				$('.popup').on("click",function(){
					//Remove any old windows
					var id = $(this).closest('tr').data('id');
					$('.popup-window').remove();
					var templateName = $(this).data('template');
					var template = templates.getTemplate(templateName);
					getStorage(id,function(Storage){
						var $element = template.bind(Storage);
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
						centerPopup($element);
					});
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
			function doPricing(_Storage,_$element){
				var $element = _$element;
				var $form = $element.find('form');
				var $basicPricingTable = $('#default-pricing-table');
				var $datePricingTable = $('#date-pricing-table');
				var template = templates.getTemplate("pricing-row");
				var Storage = _Storage;
				
				function datePricing(){
					if(!Storage.pricing || !Storage.pricing.length){
						var data={};
						var from = new Date(),
							to = new Date();
						to.setDate(from.getDate() + 364);
						data.from = from.toISOString().substring(0, 10);
						/*data.to = to.toISOString().substring(0, 10);*/
						addPricingRow(data);
					}else{
						for(i in Storage.pricing){
							Storage.pricing[i].from = new Date(Storage.pricing[i].from).toISOString().substring(0, 10);
							Storage.pricing[i].to = new Date(Storage.pricing[i].to).toISOString().substring(0, 10);
							Storage.pricing[i].price = toPrice(Storage.pricing[i].price);
							Storage.pricing[i].charge = toPrice(Storage.pricing[i].charge);
							Storage.pricing[i].reserve = toPrice(Storage.pricing[i].reserve);
							var $row = template.bind( Storage.pricing[i] );
							$datePricingTable.append($row);
						}
					}
				}
				function events(){
					$element.find('.add').on("click",function(){
						if( lm.isFormValid($(this).closest('form').attr('id')) ){
							addPricingRow();
							rebind();
						}
					});
					$form.on("submit",function(ev){
						ev.preventDefault();
						if( lm.isFormValid($(this).closest('form').attr('id')) ){
							Storage.basicPricing=getBasicPricing();
							Storage.pricing=toArray();
							$(document).trigger("popup-form-success",Storage._id);
							closePopup();
						}
					});
					$element.on('click','.trash-button',function(){
						$(this).closest('tr').remove();
						rebind();
					});
				}
				function basicPricing(){
					var basicPricing = Storage.basicPricing ? Storage.basicPricing : {};
					var basicPricingTemplate = templates.getTemplate("basic-pricing-row");
					basicPricing.price = toPrice(basicPricing.price);
					basicPricing.charge = toPrice(basicPricing.charge);
					basicPricing.reserve = toPrice(basicPricing.reserve);
					var $basicPricing = basicPricingTemplate.bind(basicPricing);
					$basicPricingTable.find('tbody').append($basicPricing);
				}
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
					$datePricingTable.append($newrow);
				}
				function getBasicPricing(){
					var $pricing = $basicPricingTable.find('tbody tr').first();
					var pricing = {};
					bindFormToObject($pricing,pricing);
					return pricing;
				}
				function toArray(){
					var array=[];
					$datePricingTable.find('tbody tr').each(function(){
						var price={};
						bindFormToObject($(this),price);
						price.from = new Date(price.from).toISOString();
						price.to = new Date(price.to).toISOString();
						if(price.price || price.charge || price.reserve){
							array.push(price);
						}
					});
					return array;
				}
				function rebind(){
					sortDateMaxMin($datePricingTable);
					lm.rebind($form);
				}
				function init(){
					events();
					basicPricing();
					datePricing();
				}
				init();
			}
			function doPallets(_Storage,$element){
				var template = templates.getTemplate("pallet-row");
				var Storage = _Storage;
				var $form = $element.find('form');
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
						rebind();
					}
				});
				$form.on("submit",function(ev){
					ev.preventDefault();
					if( lm.isFormValid($form.attr('id')) ){
						Storage.pallets=toArray();
						$(document).trigger("popup-form-success",Storage._id);
						closePopup();
					}
				});
				$element.on('click','.trash-button',function(){
					$(this).closest('tr').remove();
					rebind();
				});
				$form.on("change",'input[name="inUse"]',function(){
					var $tr = $(this).closest('tr');
					var obj={};
					bindFormToObject($tr,obj);
					obj.free=obj.total-obj.inUse;
					var $row = template.bind( obj );
					$tr.replaceWith($row);
					rebind();
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
					lm.rebind($form);
					sortDateMaxMin($form.find('table'));
				}
				
			}
			function doDiscount(_Storage,$element){
				var template = templates.getTemplate("discount-row");
				var Storage = _Storage;
				var $form = $element.find('form');
				var $table =  $form.find('table');
				if(!Storage.discounts || !Storage.discounts.length){
					addDiscountRow();
				}else{
					for(i in Storage.discounts){
						addDiscountRow( Storage.discounts[i] );
					}
				}
				$element.find('.add').on("click",function(){
					if( lm.isFormValid($form.attr('id')) ){
						var max = $table.find('tbody tr').last().find('input[name="to"]').val();
						if(Number(Storage.noDiscount) === Number(Storage.palletSpaces) || 
							Number(max) === Number(Storage.palletSpaces) ){
							
						}else{
							addDiscountRow();
							lm.rebind($form);
						}
					}
				});
				$form.on("submit",function(ev){
					ev.preventDefault();
					if( lm.isFormValid($form.attr('id')) ){
						Storage.discounts=toArray();
						$(document).trigger("popup-form-success",Storage._id);
						closePopup();
					}
				});
				$element.on('click','.trash-button',function(){
					$(this).closest('tr').remove();
					lm.rebind($form);
				});
				$form.find('input[name="noDiscount"]').on("change",function(){
					var $input = $(this);
					Storage.noDiscount=$(this).val();
					if(Number($input.val()) === Number(Storage.palletSpaces)){
						$table.find('tbody').empty();
					}else{
						setNextRow(0,Number($(this).val())+1);
					}
					lm.rebind($form);
				});
				$form.on("change",'input[name="to"]',function(){
					var index = $(this).closest('tr').index();
					setNextRow(index+1,Number($(this).val())+1);
					lm.rebind($form);
				});
				function setNextRow(index,value){
					var $row = $form.find('tbody tr').eq(index);
					if(!$row.length) return;
					var $from = $row.find('.discount-from');
					$from.find('span').text( value );
					$from.find('input').val( value ).attr('min',value).attr('max',value);
					$row.find('.discount-to input').attr('min',value);
				}
				function addDiscountRow(_data){
					var data = _data || {};
					if(!_data){
						data.from = Storage.noDiscount ? Number(Storage.noDiscount ) + 1 : 1;
						data.to = Storage.palletSpaces;
						data.perc = 0;
						data.noDiscount=0;
						var arr = toArray();
						if(arr.length){
							data.from=Number(arr[arr.length-1].to )+1;
							data.to=Storage.palletSpaces;
						}
					}
					data.perc = Number(data.perc).toFixed(1);
					data.total = Storage.palletSpaces;
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