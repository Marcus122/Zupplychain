define(["jquery"], function ($) {
	var c;
	if(!c){
		c= new Class();
	}
	function Class(){
		var err,
			csrf = $('meta[name="csrf-token"]').attr("content");
		
		function loadWarehouse(url,cb){
			$.ajax({
				url: url,
				type:'GET',
				contentType: 'application/json; charset=utf-8',
				dataType:'html',
				headers: {'csrf-token':csrf},
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
				headers: {'csrf-token':csrf},
				success: function(response){
					cb(response)
				},
				error:function(jqXHR, textStatus, errThrown){
					err = JSON.parse(jqXHR.responseText);
					cb(err);
				}
			});
		}
		
		function rebuildWarehouseList(cb){
			var url = '/rebuild-warehouse-list';
			$.ajax({
				url: url,
				type: 'GET',
				dataType: 'html',
				headers: {'csrf-token':csrf},
				success: function(response){
					cb(response)
				},
				error:function(jqXHR, textStatus, errThrown){
					err = JSON.parse(jqXHR.responseText);
					cb(err);
				}
			});
		}
		
		function rebuildWarehouseDropdownList(cb){
			var url = '/rebuild-warehouse-dropdown-list';
			$.ajax({
				url: url,
				type: 'GET',
				dataType: 'html',
				headers: {'csrf-token':csrf},
				success: function(response){
					cb(response)
				},
				error:function(jqXHR, textStatus, errThrown){
					err = JSON.parse(jqXHR.responseText);
					cb(err);
				}
			});
		}
		
		function rebuildContactsView(cb){
			var url = '/rebuild-contacts-view';
			$.ajax({
				url: url,
				type: 'GET',
				dataType: 'html',
				headers: {'csrf-token':csrf},
				success: function(response){
					cb(false,response)
				},
				error:function(jqXHR, textStatus, errThrown){
					err = JSON.parse(jqXHR.responseText);
					cb(err);
				}
			});
		}
		
		function getWarehouseContacts(warehouseId,cb){
			var url = '/get-warehouse-contacts/' + warehouseId;
			$.ajax({
				url:url,
				type: 'GET',
				dataType:'html',
				headers: {'csrf-token':csrf},
				success:function(response){
					cb(response);
				},
				error:function(jqXHR,textStatus,errThrown){
					err = JSON.parse(jqXHR.responseText);
					cb(err);
				}
			})
		}
		
		function createContact(data,cb){
			var url = '/create-contact';
			$.ajax({
				url:url,
				type: 'POST',
				dataType:'json',
				data: data,
				headers: {'csrf-token':csrf},
				success:function(response){
					cb(response);
				},
				error:function(jqXHR,textStatus,errThrown){
					err = JSON.parse(jqXHR.responseText);
					cb(err);
				}
			})
		}
		
		function resendRegisterEmail(userId,data,cb){
			var url = '/resend-register-email/' + userId;
			$.ajax({
				url:url,
				type: 'POST',
				data: data,
				headers: {'csrf-token':csrf},
				success:function(response){
					cb(response);
				},
				error:function(jqXHR,textStatus,errThrown){
					err = JSON.parse(jqXHR.responseText);
					cb(err);
				}
			})
		}
		
		function deleteItems(data,cb){
			var url = '/delete-items';
			$.ajax({
				url:url,
				type:'POST',
				data:data,
				headers: {'csrf-token':csrf},
				success:function(response){
					cb(response);
				},
				error:function(jqXHR,textStatus,errThrown){
					err = JSON.parse(jqXHR.responseText);
					cb(err);
				}
			});
		}
		
		return{
			loadWarehouse:loadWarehouse,
			rebuildPricingAndAvailability:rebuildPricingAndAvailability,
			rebuildWarehouseList:rebuildWarehouseList,
			getWarehouseContacts:getWarehouseContacts,
			createContact:createContact,
			resendRegisterEmail:resendRegisterEmail,
			rebuildContactsView:rebuildContactsView,
			rebuildWarehouseDropdownList:rebuildWarehouseDropdownList,
			deleteItems:deleteItems
		}
	}
	return c;
});