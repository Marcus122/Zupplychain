define(["jquery","components/global"], function ($,Global) {
	/*SINGLETON*/
	var c;
	if(!c){
		c= new Class();
	}
    
    function Class() {
		var url = '/warehouse',
			err,
			csrf = $('meta[name="csrf-token"]').attr("content"),
			global = new Global();
		
		function update(warehouse,cb){
			var new_url;
			if(warehouse.id){
				new_url = url + '/'+ warehouse.id;
			}else{
				new_url = url;
			}
			
			$.ajax({
				url: new_url,
				type:'POST',
				data: JSON.stringify(warehouse),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				headers: {'csrf-token':csrf},
				success:function(response){
					cb(response);
				},
				error:function(jqXHR, textStatus, errThrown){
					if(jqXHR.status === 403){
						handle403Error();
					}else{
						err = JSON.parse(jqXHR.responseText);
						cb(err);
					}
				}
			});
		}
		
	function uploadDocument(warehouseId,files,documentTitles,tempLocations,cb){
		if (files.length > 0){
			if(!files) return;
			var data = new FormData();
			var err;
			$.each(files, function(key, value)
			{
				data.append(key, value[0]);
			});
			$.each(documentTitles, function(key, value){
				data.append("title", value);
			});
			$.each(tempLocations, function(key, value){
				data.append("tempLocation", value);
			});
			$.each(tempLocations, function(key, value){
				data.append("tempLocation", value);
			});
			$.ajax({
				url: '/documents/upload/' + warehouseId,
				type: 'POST',
				data: data,
				cache: false,
				dataType: 'json',
				headers: {'csrf-token':csrf},
				processData: false, // Don't process the files
				contentType: false, // Set content type to false as jQuery will tell the server its a query string request
				success: function(data){
					cb(data);
				},
				error: function(jqXHR, textStatus, errThrown){
					if(jqXHR.status === 403){
						handle403Error();
					}else{
						err = JSON.parse(jqXHR.responseText);
						cb(err);
					}
				}
			});
		}else{
			cb({error:null})
		}
	}
	
	function deleteDocuments(warehouseId,files,cb){
		if (files.length > 0){
			if(!files) return;
			var data = new FormData();
			var err;
			$.each(files, function(key, value){
				data.append('path', JSON.stringify(value));
			});
			$.ajax({
				url: '/documents/delete/' + warehouseId,
				type: 'POST',
				data: data,
				cache: false,
				dataType: 'json',
				headers: {'csrf-token':csrf},
				processData: false, // Don't process the files
				contentType: false, // Set content type to false as jQuery will tell the server its a query string request
				success: function(data){
					cb(data);
				},
				error: function(jqXHR, textStatus, errThrown){
					if(jqXHR.status === 403){
						handle403Error();
					}else{
						err = JSON.parse(jqXHR.responseText);
						cb(err);
					}
				}
			});
		}else{
			cb({error:null})
		}
	}
	
	function deleteImages(warehouseId,images,cb){
		if (images.length > 0){
			if(!images) return;
			var data = new FormData();
			var err;
			$.each(images, function(key, value){
				data.append('image', value);
			});
			$.ajax({
				url: '/images/delete/' + warehouseId,
				type: 'POST',
				data: data,
				cache: false,
				dataType: 'json',
				headers: {'csrf-token':csrf},
				processData: false, // Don't process the files
				contentType: false, // Set content type to false as jQuery will tell the server its a query string request
				success: function(data){
					cb(data);
				},
				error: function(jqXHR, textStatus, errThrown){
					if(jqXHR.status === 403){
						handle403Error();
					}else{
						err = JSON.parse(jqXHR.responseText);
						cb(err);
					}
				}
			});
		}else{
			cb({error:null})
		}
	}

	function uploadImage(warehouseId,files,tempLocations,cb){
		if (files.length > 0){
			if(!files) return;
			var data = new FormData();
			var err;
			$.each(files, function(key, value)
			{
				data.append(key, value[0]);
			});
			$.each(tempLocations, function(key, value){
				data.append("tempLocation", value);
			});
			$.ajax({
				url: '/images/upload/' + warehouseId,
				type: 'POST',
				data: data,
				cache: false,
				dataType: 'json',
				headers: {'csrf-token':csrf},
				processData: false, // Don't process the files
				contentType: false, // Set content type to false as jQuery will tell the server its a query string request
				success: function(data){
					cb(data);
				},
				error: function(jqXHR, textStatus, errThrown){
					if(jqXHR.status === 403){
						handle403Error();
					}else{
						err = JSON.parse(jqXHR.responseText);
						cb(err);
					}
				}
			})
		}else{
			cb({error:null})
		}
	}
        
        function updateVolumeDiscount(warehouse,volumeDiscountData,cb){
        //data in format: {noDiscount : 20, discounts [from: 21, to: 25, perc: 4]}}
            var new_url = url + '/'+ warehouse.id + '/volumeDiscount/';
			$.ajax({
				url: new_url,
				type:'POST',
				data: JSON.stringify(volumeDiscountData),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				headers: {'csrf-token':csrf},
				success:function(response){
					cb(response);
				}
			});
        }
		
		function updateStorageBatch(warehouse,storage,cb){
			var new_url = url + '/'+ warehouse.id + '/storage/batch/';
			$.ajax({
				url: new_url,
				type:'POST',
				data: JSON.stringify(storage),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				headers: {'csrf-token':csrf},
				success:function(response){
					cb(response);
				},
				error:function(jqXHR, textStatus, errThrown){
					if(jqXHR.status === 403){
						handle403Error();
					}else{
						err = JSON.parse(jqXHR.responseText);
						cb(err);
					}
				}
			});
		}
		function updateStorage(warehouse,storage,cb){
			var new_url = url + '/'+ warehouse.id + '/storage/' + storage._id;
			$.ajax({
				url: new_url,
				type:'POST',
				data: JSON.stringify(storage),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				headers: {'csrf-token':csrf},
				success:function(response){
					if(cb) cb(response);
				},
				error:function(jqXHR, textStatus, errThrown){
					if(jqXHR.status === 403){
						handle403Error();
					}else{
						err = JSON.parse(jqXHR.responseText);
						cb(err);
					}
				}
			});
		}
		function getStorage(id,cb){
			var new_url = '/storage/' + id;
			$.ajax({
				url: new_url,
				type:'GET',
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				headers: {'csrf-token':csrf},
				success:function(response){
					cb(response);
				},
				error:function(jqXHR, textStatus, errThrown){
					if(jqXHR.status === 403){
						handle403Error();
					}else{
						err = JSON.parse(jqXHR.responseText);
						cb(err);
					}
				}
			});
		}
		
		function handle403Error(){
			global.show403Popup();
		}
		
		return{
			update :update,
			updateStorageBatch:updateStorageBatch,
			getStorage:getStorage,
			updateStorage:updateStorage,
            updateVolumeDiscount:updateVolumeDiscount,
			uploadDocument:uploadDocument,
			uploadImage:uploadImage,
			deleteDocuments:deleteDocuments,
			deleteImages:deleteImages
		}
	}
		
    return c; 
});