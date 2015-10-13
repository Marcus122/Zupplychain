define(["jquery","controllers/warehouse","loom/loom","templates/templates","loom/loomAlerts"], function ($,Warehouse,Loom,Templates,Alerts) {
	/*SINGLETON*/
	
    function Class(data) {
		var templates = new Templates();
		var storageNames=['A','B','C','D','E','F','G','H','I'];
		var storage=[];
		var warehouse={};
		var lm = new Loom();
		var data={};
		var DASHBOARD_PAGE = 'dashboard';
		
		function initialize() {
			step1();
			step2();
			step3();
            postcodeAnywhereInit();
			initInitialRegistration();
			
			$(document).on("click",".popup-window .close",function(){
				$(this).closest('.popup-window').remove();
			});
			
		}
		function initInitialRegistration(){
			lm.addOnSuccessCallback('contacts-registration',function(result){
				if(result.redirectUrl){
					window.location.href = result.redirectUrl;
				}
			})
		}
		function toPrice(num){
			return Number(num).toFixed(2);
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
			if($form.length > 0){
				lm.rebind($form);
				var form = lm.getForm($form.attr('id'));
				form.addOnSuccessCallback(function(result){
					if (result.message !== undefined){
						Alerts.showErrorMessage(result.message);
					}else{
						data.registered=true;
						closePopup();
					}
				});
			}
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
				if (typeof data.redirect == 'string' && typeof data.redirect !== 'undefined'){
					window.location = data.redirect;
				}else if (data.message !== undefined){
					Alerts.showErrorMessage(data.message);
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
			var documents = [];
			var documentTitles = [];
			var images = [];
			var imageTempLocations = [];
			var deletedDocuments = [];
			var deletedImages = [];
			var photosAdded = false;
			if(!$registration.length) return;
            
			$registration.on("submit",function(ev){
				ev.preventDefault();
				saveWarehouse(function(result){
					//var checkResult = checkSaveWarehouseResultAndGetMsg(result);
					if (result.error === false || result.error === null){
						var warehouseId = result.data._id;
						$('fieldset.form-footer a.tandc').after('<input name="id" value="' + warehouseId + '" type="hidden"/>')
						if ($(location).attr("pathname").indexOf(DASHBOARD_PAGE) != -1){
							$('#define-space').find('input[name="warehouse_id"]').val(warehouseId);
						}
						deleteFiles(warehouseId,function(result){
							if(result.error === false || result.error === null){
								uploadFiles(warehouseId,function(result){
									if(result.error === false || result.error === null){
										window.location = $registration.attr('action');
									}else if (result.error === true){
										Alerts.showErrorMessage(result.data);
									}
								});
							}else if (result.error === true){ 
								Alerts.showErrorMessage(result.data);
							}
						});
					} else if (result.error === true){
						if (result.data.message !== undefined){
							Alerts.showErrorMessage(result.data.message);
						}else{
							Alerts.showErrorMessage(result.data);
						}
					}
				});
			});
			$registration.find('.save').on("click",function(ev){
				saveWarehouse(function(result){
					//var checkResult = checkSaveWarehouseResultAndGetMsg(result);
					if (result.error === false || result.error === null){
						var warehouseId = result.data._id;
						$('fieldset.form-footer a.tandc').after('<input name="id" value="' + warehouseId + '" type="hidden"/>')
						deleteFiles(warehouseId,function(result){
							if(result.error === false || result.error === null){
								uploadFiles(warehouseId,function(result){
									if(result.error === false || result.error === null){
										saveRegistration();
									}else if (result.error === true){
										Alerts.showErrorMessage(result.data);
									}
								});
							}else if (result.error === true){
								Alerts.showErrorMessage(result.data);
							}
						});
					}else if (result.error === true){
						if (result.data.message !== undefined){
							Alerts.showErrorMessage(result.data.message);
						}else{
							Alerts.showErrorMessage(result.data);
						}
					}
				});
			});
			$registration.find('textarea[name="description"]').blur(function(){
				if($(this).closest('.input-field').hasClass('error-complexTelephoneNumberNotInInput')){
					$(this).parent().attr('data-hint','The description cannot contain phone numbers');
				}else if(!$(this).closest('input-field').hasClass('error-complexTelephoneNumberNotInInput')){
					$(this).parent().removeAttr('data-hint');
				}
				
			});
			$registration.find('textarea[name="description"]').keyup(function(){
				if(!$(this).closest('input-field').hasClass('error-complexTelephoneNumberNotInInput')){
					$(this).parent().removeAttr('data-hint');
				}
				
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
					if (photosAdded === true){
						warehouse.photos = [];
					}
					Warehouse.update(warehouse,function(result){
						if(cb) cb(result);
					});
				}
			}
			function deleteFiles(warehouseId,cb){
				Warehouse.deleteDocuments(warehouseId,deletedDocuments,function(result){
					if (result.error === false || result.error === null){
						Warehouse.deleteImages(warehouseId,deletedImages,function(result){
							if(cb) cb(result);
						});
					}else if (result.error === true){
						if(cb) cb(result);
					}
				});
			}
			function uploadFiles(warehouseId,cb){
				Warehouse.uploadDocument(warehouseId,documents,documentTitles,function(result){
					if (result.error === false || result.error === null){
						Warehouse.uploadImage(warehouseId,images,imageTempLocations,function(result){
							if(cb) cb(result);
						});
					}else if (result.error === true){
						if(cb) cb(result);
					}
				});
			}
			var $addPhoto = $('#add-photo');
			var $uploadPhoto = $('#photos');
			var $uploadDoc = $('#docs');
		    var $defaultPhotoInput = $("input#deafultPhoto");
			var $photoArea = $('#upload-photos');
			var $addDocument = $('#add-document');
			var $documentArea = $('#upload-documents');
			$addPhoto.on("click",function(ev){
				ev.preventDefault();
				var index = 0;
				var files = $uploadPhoto.prop("files");
				if(!files) return;
				sendFile(files,function(data){
					if(!warehouse.photos) warehouse.photos=[];
					index = images.length;
					images.push($uploadPhoto.prop("files"));
					//$uploadPhoto.val("");
					var template = templates.getTemplate("warehouse-image");
					photosAdded = true;
					for(var i in data){
						var image = data[i];
						image.file = '/images/tmp/' + data[i].name;
						var $image = template.bind( image );
						$image.attr('data-image-index',index)
						imageTempLocations.push('./images/tmp/' + data[i].name);
						if ($photoArea.find('.isDefault').length === 0){
							$("#defaultPhoto").val(image.name);
							$(".document").removeClass("isDefault");
							$image.find('.image').parent().addClass("isDefault");
						}
						$photoArea.append($image);
					}
				});
			});
			$addDocument.click(function(){
				if($uploadDoc.prop("files").length > 0){
					if($(this).closest('#document-area').find('input[name="file-title"]').val() !== ""){
						$(this).closest('#document-area').find('.input-field.file-title').removeClass('error').removeClass('error-required');
						var uploadTemplate = templates.getTemplate("upload-document");
						var $uploadTemplate = uploadTemplate.bind(data);
						$uploadTemplate.find(".file-name").html($('input[name="file-title"]').val())
						$uploadTemplate.attr('data-doc-index',documents.length)
						$('#upload-documents').append($uploadTemplate);
						documentTitles.push($('input[name="file-title"]').val());
						documents.push($uploadDoc.prop("files"));
						//$uploadDoc.val("");
						$(this).closest('#document-area').find('input[name="file-title"]').val("");
					}else{
						$(this).closest('#document-area').find('.input-field.file-title').addClass('error').addClass('error-required');
					}
				}
			});
			$('input[name="file-title"]').blur(function(){
				$(this).parent().removeClass('success');
			})
			$photoArea.on("click",".trash-button",function(ev){
				ev.preventDefault();
				var index = $(this).closest('.document').attr('data-image-index');
				deletedImages.push($(this).parent().siblings('input[name="photo"]').val());
				if (index !== "" && index !== undefined){
					parseInt(index)
					images.splice(index,1);
					imageTempLocations.splice(index,1);
					$('div[data-image-index]').each(function(){
						var oldIndex = parseInt($(this).attr('data-image-index'));
						if (oldIndex > index){
							oldIndex --;
							$(this).removeAttr('data-image-index');
							$(this).attr('data-image-index',oldIndex);
						}
					})
				}
				if ($(this).closest('.row.document').hasClass('isDefault')){
					$(this).closest('.row.document').next().addClass('isDefault');
					$("#defaultPhoto").val($(this).closest('.row.document').next().find('.file-name').text());
				}
				$(this).closest('.document').remove();
				//Check Photos added
			});
			$documentArea.on("click",".trash-button",function(ev){
				ev.preventDefault();
				var index = $(this).closest('.document').attr('data-doc-index');
				$(this).closest('.document').remove();
				deletedDocuments.push({path: $(this).parent().siblings('input[name="relative-path"]').val(),title: $(this).parent().siblings('.file-name').text()});
				if (index !== "" && index !== undefined){
					parseInt(index);
					documents.splice(index,1);
					documentTitles.splice(index,1);
					$('div[data-doc-index]').each(function(){
						var oldIndex = parseInt($(this).attr('data-doc-index'));
						if (oldIndex > index){
							oldIndex --;
							$(this).removeAttr('data-doc-index');
							$(this).attr('data-doc-index',oldIndex);
						}
					});
				}
			});
            
            $(document).on("click", ".make-default-photo", function(evt) {
                $("#defaultPhoto").val($(this).data("photo"));
                $("#upload-photos .document").removeClass("isDefault");
                $(this).closest(".document").addClass("isDefault");
            });
			
			$('input[name="allProdInsurance"]').change(function(){
				if ($(this).is(":checked")){
					$(this).val('Insured for Storing All Products');
				}else{
					$(this).val("");
				}
			});
			
			$('input[name="additionalInsurance"]').change(function(){
				if ($(this).is(":checked")){
					$(this).val('Additional Insurance');
				}else{
					$(this).val("");
				}
			});
            
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
				//ev.stopPropagation();
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
			var json = $input.data('json');
			var jsonKey;
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
			}else if(json){
				jsonKey = $input.attr('name');
				if(!object[json]){
					object[json] = {};
				}
				if($input.attr('type') === 'checkbox'){
					if($input.is(':checked')){
						object[json][jsonKey] = $input.attr('value');
					}else{
						object[json][jsonKey] = "";
					}
				}else if($input.attr('type') === 'file'){
					//Do nothing
				}else{
					object[json][jsonKey] = ($input.val());
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
