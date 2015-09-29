define(["jquery","loom/loom","loom/loomAlerts"], function ($,Loom,Alerts) {
	
    function Class() {
		var LOGIN_FAILED_MESSAGE = "The email address or password was incorrect";
		var loom = new Loom(),
			$mainView = $('div[data-view="main"]'),
			$adminView = $('div[data-view="admin"]'),
			$warehouseView = $('div[data-view="warehouses"]'),
			$contactsView = $('div[data-view="contacts"]'),
			$usersView = $('div[data-view="users"]');
		
		initNavEvents();
		initContactsTabs();
		initPaging($("#warehouses-table"));
		
		loom.addOnSuccessCallback("login-form", function(response){
			if (response.data === LOGIN_FAILED_MESSAGE){
				Alerts.showErrorMessage(LOGIN_FAILED_MESSAGE);
			}else{
				window.location.href = '/dashboard';
			}
        });
		
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
		
		function initContactsTabs(){
			$('.tabs .tab-links a').on('click',function(e){
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