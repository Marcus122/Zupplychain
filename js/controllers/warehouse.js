define(["jquery"], function ($) {
	/*SINGLETON*/
	var c = new Class();
    
    function Class() {
		var url = '/warehouse';
		
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
				}
			});
		}
		
		function updateStorageBatch(warehouse,storage,cb){
			var new_url = url + '/'+ warehouse.id + '/storage/batch';
			$.ajax({
				url: new_url,
				type:'POST',
				data: JSON.stringify(storage),
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				success:function(response){
					cb(response);
				}
			});
		}
		
		return{
			update :update,
			updateStorageBatch:updateStorageBatch
		}
	}
		
    return c; 
});