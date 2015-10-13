define(["jquery","loom/loom","loom/loomAlerts","controllers/dashboard","templates/templates"], function ($,Loom,Alerts,DBCntr,Templates) {
	
    function Class() {
		var templates = new Templates();
		var LOGIN_FAILED_MESSAGE = "The email address or password was incorrect";
		var ACTION_ADD_NEW_WAREHOUSE = "add-new-warehouse";
		var ACTION_VIEW_EDIT_WAREHOUSE = "view-edit-warehouse";
		var loom = new Loom(),
			backLinks = [],
			currentView = "#main",
			$mainView = $('div[data-view="main"]'),
			$adminView = $('div[data-view="admin"]'),
			$warehouseView = $('div[data-view="warehouses"]'),
			$contactsView = $('div[data-view="contacts"]'),
			$usersView = $('div[data-view="users"]');
		
		initNavEvents();
		initTabs();
		triggerHashClick();
		initAccountTab();
		initWarehouseTab();
		initContactsTab();
		initPaging($("#warehouses-table"));
		
		loom.addOnSuccessCallback("login-form", function(response){
			if (response.data === LOGIN_FAILED_MESSAGE){
				Alerts.showErrorMessage(LOGIN_FAILED_MESSAGE);
			}else{
				window.location.href = '/dashboard';
			}
        });
		
		function triggerHashClick(){
			var hash = $.trim(window.location.hash);
			if(hash) $('a[href$="' + hash + '"]').trigger('click');
		}
		
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
				var $this = $(this);
				var $warehouseContainer = $('#view-edit-warehouse');
				DBCntr.loadWarehouse($this.attr('href'),function(response){
					var $warehouse = $(response);
					$warehouseContainer.empty();
					$warehouseContainer.append($warehouse);
					$warehouseContainer.show();
					initTabs();
					prepareWarehouseView($this);
					$warehouseContainer.find('input').prop('disabled',true);
					$warehouseContainer.find('button').prop('disabled',true);
					$warehouseContainer.find('textarea').prop('disabled',true);
					$warehouseContainer.find('select').prop('disabled',true);
					
					require(["components/provider-registration"], function(Registration) {
						Registration();
						$("#view-edit-warehouse form.loom-form").each(function(){//Rebind loom with all the warehouse forms
							loom.rebind($(this));
						});
					});   
				});
			});
			
			$(document).on('click', '.toggle-view-edit',function(){
				var $this = $(this);
				var $tab = $this.closest('#view-edit-warehouse');
				if ($this.hasClass('down')){
					if($this.data('mode') === 'view'){
						$tab.find('input').prop('disabled',true);
						$tab.find('button').prop('disabled',true);
						$tab.find('textarea').prop('disabled',true);
						$tab.find('select').prop('disabled',true);
					}else if($this.data('mode') === 'edit'){
						$tab.find('input').prop('disabled',false);
						$tab.find('button').prop('disabled',false);
						$tab.find('textarea').prop('disabled',false);
						$tab.find('select').prop('disabled',false);
					}
				}
			});
			
			$(document).on('click','.add-new-warehouse-container .button',function(e){
				e.preventDefault();
				var $this = $(this);
				DBCntr.loadWarehouse($this.attr('href'),function(response){
					var $warehouse = $(response);
					$('#add-new-warehouse').append($($warehouse));
					$('#add-new-warehouse').show();
					prepareWarehouseView($this);
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
				$('#add-new-warehouse ul li:first-child').addClass('checked');
				e.preventDefault();
			});
			
			$(document).on('submit','#define-space',function(e){
				var $tab = $('ul.tabs li:nth-child(3)');
				var clickedTab = $tab.find('a').attr('href');
				$('.tab-content ' + clickedTab).show().siblings().hide();
				$tab.addClass('active').siblings().removeClass('active');
				$('#add-new-warehouse ul li:nth-child(2)').addClass('checked');
				e.preventDefault();
				rebuilPricingAndAvailability();
			});
			
			$(document).on('click','#define-space .save',function(e){
				rebuilPricingAndAvailability();
			});
			
			$(document).on('click',"#add-new-warehouse #save-and-finish",function(ev) {
				$('#add-new-warehouse').empty();
			});
		}
		
		function rebuilPricingAndAvailability(){
			DBCntr.rebuildPricingAndAvailability($('input[name="warehouse_id"]').val(),function(response){
				$("#step-3").empty();
				$("#step-3").append($(response));
			});
		}
		
		function rebuildWarehouseList(){
			DBCntr.rebuildPricingAndAvailability($('input[name="warehouse_id"]').val(),function(response){
				$('div[data-view="warehouses"]').empty();
				$('div[data-view="warehouses"]').append($(response));
			});
		}
		
		function prepareWarehouseView($this){
			var $viewEditButtons = $('.view-edit-buttons');
			$this.closest('div[data-view="warehouses"]').find('.content-box[data-content="warehouses"]').hide();
			$this.closest('.dashboard-container').parent('.main').css('background-color','initial');
			//$this.closest('div[data-view="warehouses"]').find('input[type="date"]').datepicker().show();
			loom = new Loom();
			if($this.data('action') === ACTION_ADD_NEW_WAREHOUSE){
				$viewEditButtons.hide();
			}else if($this.data('action') === ACTION_VIEW_EDIT_WAREHOUSE){
				$viewEditButtons.show();
			}
		}
		
		function initNavEvents(){
			$('#vertical-nav ul li a, a.tile-button').click(function(){
				var $this = $(this);
				$('div[data-view="warehouses"]').find('.content-box[data-content="warehouses"]').show();
				$('#view-edit-warehouse').find('.row').remove();
				$('#add-new-warehouse').find('.row').remove();
				$this.parent('li').parent('ul').parent('#vertical-nav').parent('.main').css('background-color','#d7d7d7');
				var href = $this.attr('href');
				if (currentView !== "") backLinks.push(currentView);
				currentView = href;
				var $corrView = $('div[data-view="' + href.replace('#','') +'"]');
				$corrView.show().siblings('.dashboard-container').hide();
				$this.parent('li').addClass('active').siblings().removeClass('active');
			});
			$('.dashboard-back').click(function(){
				var length = backLinks.length;
				$($(this).parent('.container').parent('.form-footer').prev('section').find('.main')[0]).css('background-color','#d7d7d7');
				if (length > 0){
					var $corrView = $('div[data-view="' + backLinks[length-1].replace('#','') +'"]');
					$corrView.show().siblings('.dashboard-container').hide();
					if ($('#vertical-nav ul li a[href="' + backLinks[length-1] + '"]').length > 0){
						$('#vertical-nav ul li a[href="' + backLinks[length-1] + '"]').parent('li').addClass('active').siblings().removeClass('active');
					}else{
						$('li.active').removeClass('active');
					}
					backLinks.pop();
					if (backLinks.length === 0){
						currentView = "#main";
					}
				}else{
					window.location.href = '/';
				}
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
				var $this = $(this);
				var clickedTab = $this.attr('href');
				$('.tab-content ' + clickedTab).show().siblings().hide();
				$this.parent('li').addClass('active').siblings().removeClass('active');
				e.preventDefault();
			});
		}
		
		function initContactsTab(){
			$('button[name="view-warehouse-contacts"]').on('click',function(){
				var $this = $(this);
				$('.warehouse-specific-contacts').remove();
				DBCntr.getWarehouseContacts($(this).prev('select').find(':selected').data('id'),function(result){
					if(result.err === true){
						Alerts.showPersistentErrorMessage(result.data);
					}else{
						$this.closest('div[data-view="contacts"]').append(result);
						initTabs();
					}
				});
			});
			$(document).on('click','button[name="add-new-contact"]',function(){
				var $this = $(this),
					templateId = $this.parent('div').data('contact-type') + '-row',
					template = templates.getTemplate(templateId),
					row = template.bind({});
					
					$this.siblings('table').find('tbody').append(row);
			});
			
			$(document).on('click','button[name="save-new-contacts"]',function(){
				var $this = $(this),
					contactType = $this.parent('div').attr('id').replace(/-([a-z])/g, function (g) { return ' ' + g[1].toUpperCase(); }),
					data = {},
					rows = [],
					cbDone = 0,
					error = false;
					
					contactType = contactType.charAt(0).toUpperCase() + contactType.substring(1);
					
					rows = $this.siblings('table').find('tr[data-status="new"]');
					data.warehouseContacts = $this.closest('.warehouse-specific-contacts').data('warehouse-contacts') || "";
					data.role = contactType;
					for (var i = 0; i<rows.length; i++){
						data.email = $(rows[i]).find('td[data-field="email"]').find('input').val();
						data.name = $(rows[i]).find('td[data-field="name"]').find('input').val();
						data.phoneNumber = $(rows[i]).find('td[data-field="phone-number"]').find('input').val();
						data.dashboardAccess = $(rows[i]).find('tr[data-status="new"]').find('td[data-field="dashboard-access"]').find('input').val();
						DBCntr.createContact(data,function(response){
							cbDone ++;
							if(response.error === true){
								error = true;
							}
							if (cbDone === rows.length){
								if(error === true){
									Alerts.showPersistentErrorMessage('Not all contacts have been added');
								}else{
									Alerts.showSuccessMessage('All contacts have been successfully added');
								}
							}
						});
					}
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