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
            postcodeAnywhereInit();
			
			$(document).on("click",".popup-window .close",function(){
				$(this).closest('.popup-window').remove();
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
			$('.popup-window').not("#volume-discount-popup").remove();
		}
		
		function dateRanges(){
			/*$(document).on('change','table input[type="date"]',function(){
				var $form = $(this).closest('form');
				var $row = $(this).closest('tr');
				var $from = $row.find('input[name="from"]');
				var $to = $row.find('input[name="to"]');
				if($from.val()){
					$to.attr('min',$from.val());
				}
				if($to.val()){
					$from.attr('max',$to.val());
				}
				lm.rebind($form);
			});*/
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
					//var checkResult = checkSaveWarehouseResultAndGetMsg(result);
					if (result.error === false || result.error === null){
						window.location = $registration.attr('action');
					} else if (result.error === true){
						Alerts.showErrorMessage(result.data);
					}
				});
			});
			$registration.find('.save').on("click",function(ev){
				saveWarehouse(function(result){
					//var checkResult = checkSaveWarehouseResultAndGetMsg(result);
					if (result.error === false || result.error === null){
							saveRegistration();
					}else if (result.error === true){
						Alerts.showErrorMessage(result.data);
					}
				});
			});
			function checkSaveWarehouseResultAndGetMsg(warehouseResult){
				var result;
				if (warehouseResult.error === undefined || warehouseResult.error === false || warehouseResult.error === null){
					if (warehouseResult.data.geo.lat !== null && warehouseResult.data.geo.lng !== null){
						result = {error:false, message:"Successful Call"};
					}else{
						result = {error:true, message:"Postcode Not Found"};
					}
				}else if (warehouseResult.error === true){
					result = {error:true, message:"An Error has Occurred, Check your Internet Connection, if the Problem Persists Contact an Administrator"}
				}
				return result;
			}
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
		    var $defaultPhotoInput = $("input#deafultPhoto");
			var $photoArea = $('#upload-photos');
			var $documentArea = $('#document-area');
			var $documentRow = $('#document-row');
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
                        $("#defaultPhoto").val(image.name);
                        $(".document").removeClass("isDefault");
                        console.log($image);
						$photoArea.append($image);
                        $image.find('.image').parent().addClass("isDefault");
						$uploadPhoto.val("");
					}
				});
			});
			$photoArea.on("click",".trash-button",function(ev){
				ev.preventDefault();
				$(this).closest('.document').remove();
			});
			
			$documentArea.on("click",".add-button",function(ev){
				ev.preventDefault();
				$(this).closest($documentRow).clone().appendTo($documentArea);
			});
            
            $(document).on("click", ".make-default-photo", function(evt) {
                $("#defaultPhoto").val($(this).data("photo"));
                $("#upload-photos .document").removeClass("isDefault");
                $(this).closest(".document").addClass("isDefault");
            })
            
		}
		function step2(){
            
            $("#define-space .back").click(function() {
                saveDefinedSpace(function(response){
					if (response !== undefined){
						if (response.error !== undefined && response.error === true && response.data !== undefined && response.data === "Users do not Match"){
							window.location.href = '/'
						}
					}
				});
            });
            
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
			$defineSpace.on("click",".next",updateForm);
			$defineSpace.on("submit",function(ev){
				ev.preventDefault();
				ev.stopPropagation();
				updateForm();
				saveDefinedSpace(function(response){
					if (response !== undefined){
						if (response.error !== undefined && response.error === true && response.data !== undefined && response.data === "Users do not Match"){
							window.location.href = '/';
						}else{
							window.location = $defineSpace.attr('action');
						}
					}else{
						window.location = $defineSpace.attr('action');
					}
				});
			});
			$defineSpace.find('.save').on("click",function(ev){
				ev.preventDefault();
				updateForm();
				if( lm.isFormValid($defineSpace.attr('id')) ){
					saveDefinedSpace(function (response){
						if (response !== undefined){
							if (response.error !== undefined && response.error === true && response.data !== undefined && response.data === "Users do not Match"){
								window.location.href = '/'
							}
						}
					});
					saveRegistration();
				}
			});
			function updateForm(){
				var rebind=false;
				if($defineSpaceTable.find('tbody tr').length === 1) return;
				$defineSpaceTable.find('tbody tr').each(function(){
					var s={};
					bindFormToObject($(this),s);
					for(var i in s){
						if(s[i]) return true;
					}
					$(this).find('input,select').removeAttr('required');
					rebind=true;
				});
				if(rebind){
					lm.rebind($defineSpace);
				}
			}
			function saveDefinedSpace(cb){
				if( lm.isFormValid($defineSpace.attr('id')) ){
					var storage=[];
					$defineSpaceTable.find('tbody tr').each(function(){
						var s={};
						bindFormToObject($(this),s);
						for(var i in s){
							if(s[i]){
								storage.push(s);
								return true;
							}
						}
					});
					var warehouse={};
					warehouse.id = $defineSpace.find('input[name="warehouse_id"]').val();
					Warehouse.updateStorageBatch(warehouse,storage,function(response){
						if(cb) cb(response);
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
				var template = templates.getTemplate("define-space-row");
				var data={};
				data.name = storageNames[$('.define-space tbody tr').length];
				var $element = template.bind(data);
				$('.define-space tbody').append($element);
				rebindForm();
			}
		}
		function step3(){
            var $onStep3 = $('#price-and-availability-user-data');
            if(!$onStep3.length > 0) {
                return;
            }
			require(["components/provider-registration-3"]);
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
					if($input.attr('type') === 'file'){
						//object[array].push($input.prop("files"));
					}else{
						object[array].push($input.val());
					}
				}
			}else{
				if(name){
					object[name] = $input.val();
				}
			}
		});
	}
    
    function postcodeAnywhereInit() {
        require(["components/postcodeanywhere"], function(postcode){
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
