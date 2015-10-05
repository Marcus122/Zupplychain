define(["jquery","loom/loom","loom/loomAlerts","controllers/dashboard","templates/templates"], function ($,Loom,Alerts,DBCntr,Templates) {
	
    function Class() {
		var templates = new Templates();
		var LOGIN_FAILED_MESSAGE = "The email address or password was incorrect";
		var loom = new Loom(),
			$mainView = $('div[data-view="main"]'),
			$adminView = $('div[data-view="admin"]'),
			$warehouseView = $('div[data-view="warehouses"]'),
			$contactsView = $('div[data-view="contacts"]'),
			$usersView = $('div[data-view="users"]');
		
		initNavEvents();
		initTabs();
		initAccountTab();
		initWarehouseTab();
		initPaging($("#warehouses-table"));
		
		loom.addOnSuccessCallback("login-form", function(response){
			if (response.data === LOGIN_FAILED_MESSAGE){
				Alerts.showErrorMessage(LOGIN_FAILED_MESSAGE);
			}else{
				window.location.href = '/dashboard';
			}
        });
		
		function initAccountTab(){
			loom.addOnSuccessCallback("save-account-details-form", function(response){
				if (!response.error){
					$(".user-links p span:nth-child(3)").text(response.data.email);
					Alerts.showSuccessMessage(response.data.message);
				}else if(response.error){
					Alerts.showErrorMessage(response.data);
				}
			});
			loom.addOnSuccessCallback("change-password-form", function(response){
				if (response.data.successMessage){
					Alerts.showSuccessMessage(response.data.successMessage);
				}else{
					Alerts.showErrorMessage(response.data);
				}
			});
		}
		
		function initWarehouseTab(){
			$(document).on('click','#warehouses-table tbody tr td .button',function(e){
				e.preventDefault();
				DBCntr.loadWarehouse($(this).attr('href'),function(response){
					var $warehouse = $(response);
					$('#view-edit-warehouse').append($warehouse);
					$('#view-edit-warehouse').show();
					initTabs();
					
					require(["components/provider-registration"], function(Registration) {
						Registration();
						loom.rebind('registration');
						loom.rebind('define-space');
					});   
				});
			});
			
			$(document).on('click','.add-new-warehouse-container .button',function(e){
				e.preventDefault();
				DBCntr.loadWarehouse($(this).attr('href'),function(response){
					$(response).find('#registration').attr('action','/registration-2');
					$(response).find('#define-space').attr('action','/registration-3');
					var $warehouse = $(response);
					$('#add-new-warehouse').append($($warehouse));
					$('#add-new-warehouse').show();
					$('#add-new-warehouse').find('section.tabs').removeClass('tabs').find('li').removeClass('checked');
					initTabs();
					
					require(["components/provider-registration"], function(Reg) {
						Reg();
						loom.rebind('registration');
						loom.rebind('define-space');
					});   
				});
			});
			
			$(document).on('submit','#registration',function(e){
				var $tab = $('ul.tabs li:nth-child(2)');
				var clickedTab = $tab.find('a').attr('href');
				$('.tab-content ' + clickedTab).show().siblings().hide();
				$tab.addClass('active').siblings().removeClass('active');
				e.preventDefault();
				$('#define-space').find("input[name='warehouse_id']").val($('input[name="id"]').val());
			});
			
			$(document).on('submit','#define-space',function(e){
				var $tab = $('ul.tabs li:nth-child(3)');
				var clickedTab = $tab.find('a').attr('href');
				$('.tab-content ' + clickedTab).show().siblings().hide();
				$tab.addClass('active').siblings().removeClass('active');
				e.preventDefault();
			});
		}
		
		function initNavEvents(){
			$('#vertical-nav ul li a').click(function(){
				var href = $(this).attr('href');
				var $corrView = $('div[data-view="' + href.replace('#','') +'"]');
				$corrView.show().siblings('.dashboard-container').hide();
				$(this).parent('li').addClass('active').siblings().removeClass('active');
			});
		}
		function initPaging($table){
			require(["loomTable/Table"], function(loomTable) {
				var LoomTable = new loomTable($table, {
				});
				$mainView = $('div[data-view="main"]'),
				$adminView = $('div[data-view="admin"]'),
				$warehouseView = $('div[data-view="warehouses"]'),
				$contactsView = $('div[data-view="contacts"]'),
				$usersView = $('div[data-view="users"]');
			});
		}
		
		function initTabs(){
			$('.tabs ul.tabs a').on('click',function(e){
				var clickedTab = $(this).attr('href');
				$('.tab-content ' + clickedTab).show().siblings().hide();
				$(this).parent('li').addClass('active').siblings().removeClass('active');
				e.preventDefault();
			});
		}
		
		function buildContactsJson(){
			var jsonArr = [];
			var json = {};
			var dbContactsOrder = ['availabilityController','enquiresController','transportCoordinator','goodsIn','pickingDispatch','invoiceController','creditController'];
			var $availabilityController = $('div#availability-controller table');
			var $enquiresController = $('div#enquires-controller table');
			var $transportCoordinator = $('div#transport-coordinator table');
			var $goodsIn = $('div#goods-in table');
			var $pickingDispatch = $('div#picking-dispatch table');
			var $invoiceController = $('div#invoiceController table');
			var $creditController = $('div#creditController table');
			var table = [$availabilityController,$enquiresController,$transportCoordinator,$goodsIn,$pickingDispatch,$invoiceController,$creditController]
			// for (var i = 0; i<table.length; i++){
			// 	for (var j = 0, row; row = table.rows[j]; j++){
			// 		for (var k = 0, col; col = row.cells[k]; k++){
			// 			var ontacts = getContactsJSON();
			// 		}
			// 	}
			// }
		}
	}
	return Class;
});