define(["jquery"], function ($) {
	var c;
	if(!c){
		c= new Class();
	}
	function Class(){
		var err;
		
		function loadWarehouse(url,cb){
			$.ajax({
				url: url,
				type:'GET',
				contentType: 'application/json; charset=utf-8',
				dataType:'html',
				success:function(response){
					cb(response);
				},
				error:function(jqXHR, textStatus, errThrown){
					err = JSON.parse(jqXHR.responseText);
					cb(err);
				}
			});
		}
		
		function rebuildPricingAndAvailability(warehouseId,cb){
			var url = '/rebuild-pricing-and-availability/' + warehouseId;
			$.ajax({
				url: url,
				type: 'GET',
				dataType: 'html',
				success: function(response){
					cb(response)
				},
				error:function(jqXHR, textStatus, errThrown){
					err = JSON.parse(jqXHR.responseText);
					cb(err);
				}
			});
		}
		
		function rebuildWarehouseList(warehouseId,cb){
			var url = '/rebuild-warehouse-list/' + warehouseId;
			$.ajax({
				url: url,
				type: 'GET',
				dataType: 'html',
				success: function(response){
					cb(response)
				},
				error:function(jqXHR, textStatus, errThrown){
					err = JSON.parse(jqXHR.responseText);
					cb(err);
				}
			});
		}
		
		return{
			loadWarehouse:loadWarehouse,
			rebuildPricingAndAvailability:rebuildPricingAndAvailability,
			rebuildWarehouseList:rebuildWarehouseList
		}
	}
	return c;
});