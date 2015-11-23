define(["jquery","components/global"], function ($,Global) {
	var c;
	if(!c){
		c= new Class();
	}
	function Class(){
		var err,
			csrf = $('meta[name="csrf-token"]').attr("content"),
			global = new Global();
		
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
					if(jqXHR.status === 403){
						handle403Error();
					}else{
						err = JSON.parse(jqXHR.responseText);
						cb(err);
					}
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
					if(jqXHR.status === 403){
						handle403Error();
					}else{
						err = JSON.parse(jqXHR.responseText);
						cb(err);
					}
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
					if(jqXHR.status === 403){
						handle403Error();
					}else{
						err = JSON.parse(jqXHR.responseText);
						cb(err);
					}
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
					if(jqXHR.status === 403){
						handle403Error();
					}else{
						err = JSON.parse(jqXHR.responseText);
						cb(err);
					}
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
					if(jqXHR.status === 403){
						handle403Error();
					}else{
						err = JSON.parse(jqXHR.responseText);
						cb(err);
					}
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
					if(jqXHR.status === 403){
						handle403Error();
					}else{
						err = JSON.parse(jqXHR.responseText);
						cb(err);
					}
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
					if(jqXHR.status === 403){
						handle403Error();
					}else{
						err = JSON.parse(jqXHR.responseText);
						cb(err);
					}
				}
			})
		}
		
		function getWarehouseContactsSuggestions(warehouseId,data,cb){
			var url = '/search-warehouse-contacts/' + warehouseId;
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
					if(jqXHR.status === 403){
						handle403Error();
					}else{
						err = JSON.parse(jqXHR.responseText);
						cb(err);
					}
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
					if(jqXHR.status === 403){
						handle403Error();
					}else{
						err = JSON.parse(jqXHR.responseText);
						cb(err);
					}
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
			loadWarehouse:loadWarehouse,
			rebuildPricingAndAvailability:rebuildPricingAndAvailability,
			rebuildWarehouseList:rebuildWarehouseList,
			getWarehouseContacts:getWarehouseContacts,
			createContact:createContact,
			resendRegisterEmail:resendRegisterEmail,
			rebuildContactsView:rebuildContactsView,
			rebuildWarehouseDropdownList:rebuildWarehouseDropdownList,
			deleteItems:deleteItems,
			getWarehouseContactsSuggestions:getWarehouseContactsSuggestions
		}
	}
	return c;
});