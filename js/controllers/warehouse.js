define(["jquery"], function ($) {
	/*SINGLETON*/
	var c;
	if(!c){
		c= new Class();
	}
    
    function Class() {
		var url = '/warehouse',
			err;
		
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
				success:function(response){
					cb(response);
				},
				error:function(jqXHR, textStatus, errThrown){
					err = JSON.parse(jqXHR.responseText);
					cb(err);
				}
			});
		}
		
	function uploadDocuments(files){
		//if(!files) return cb();
		var data = new FormData();
		$.each(files, function(key, value)
		{
			data.append(key, value);
		});
		$.ajax({
			url: '/documents/upload',
			type: 'POST',
			data: data,
			cache: false,
			dataType: 'json',
			processData: false, // Don't process the files
			contentType: false, // Set content type to false as jQuery will tell the server its a query string request
			success: function(data){
				//cb(data);
			},
			error: function(){
				//cb();
			}
		})
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
				success:function(response){
					cb(response);
				},
				error:function(jqXHR, textStatus, errThrown){
					err = JSON.parse(jqXHR.responseText);
					cb(err);
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
				success:function(response){
					if(cb) cb(response);
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
				success:function(response){
					cb(response);
				}
			});
		}
		
		return{
			update :update,
			updateStorageBatch:updateStorageBatch,
			getStorage:getStorage,
			updateStorage:updateStorage,
            updateVolumeDiscount:updateVolumeDiscount,
			uploadDocuments:uploadDocuments
		}
	}
		
    return c; 
});