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
		
		$(document).on('click','a[data-go-to-link="view-tab"]',function(){
			goToLinkViewTab($(this).attr('href'));
		});
		
		function initAccountTab(){
			loom.addOnSuccessCallback("save-account-details-form", function(response){
				if (!response.error){
					$(".user-links p span:nth-child(3)").text(response.data.email);
					Alerts.showSuccessMessage(response.data.message);
					changeToDisplayMode($('#save-account-details-form').find('button[type="submit"]').parent().parent());
					DBCntr.rebuildContactsView(function(err,result){
						if(!err){
							$('div[data-view="contacts"]').remove();
							$('.dashboard section div.main:first-of-type').append(result);
						}
					});
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
		
		function changeToEditMode($tab){
			$tab.find('input').prop('disabled',false);
			$tab.find('input[data-do-not-enable="true"]').prop('disabled',true);
			$tab.find('button').prop('disabled',false);
			$tab.find('textarea').prop('disabled',false);
			$tab.find('select').prop('disabled',false);
			$tab.find('div[data-function="save-buttons"]').show();
			if(!$tab.find('a[data-mode="edit"]').hasClass('down')){
				$tab.find('a[data-mode="edit"]').addClass('down');
			}
			if ($tab.find('a[data-mode="view"]').hasClass('down')){
				$tab.find('a[data-mode="view"]').removeClass('down');
			}
		}
		
		function changeToDisplayMode($tab){
			$tab.find('input').prop('disabled',true);
			$tab.find('button').prop('disabled',true);
			$tab.find('textarea').prop('disabled',true);
			$tab.find('select').prop('disabled',true);
			$tab.find('div[data-function="save-buttons"]').hide();
			if($tab.find('a[data-mode="edit"]').hasClass('down')){
				$tab.find('a[data-mode="edit"]').removeClass('down');
			}
			if (!$tab.find('a[data-mode="view"]').hasClass('down')){
				$tab.find('a[data-mode="view"]').addClass('down');
			}
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
					$warehouseContainer.find('.form-footer div[data-function="save-buttons"]').hide();
					
					require(["components/provider-registration"], function(Registration) {
						Registration();
						rebindAllLoomForms($("#view-edit-warehouse form.loom-form"))
					});   
				});
			});
			
			$(document).on('click', '.toggle-view-edit',function(){
				var $this = $(this);
				var $tab = $this.parent().parent();
				if ($this.hasClass('down')){
					if($this.data('mode') === 'view'){
						changeToDisplayMode($tab);
					}else if($this.data('mode') === 'edit'){
						changeToEditMode($tab);
					}
				}
			});
			
			$(document).on('click','.add-new-warehouse-container .button',function(e){
				e.preventDefault();
				var $this = $(this);
				var $addNewWarehouse = $('#add-new-warehouse');
				DBCntr.loadWarehouse($this.attr('href'),function(response){
					var $warehouse = $(response);
					$addNewWarehouse.append($($warehouse));
					$addNewWarehouse.show();
					prepareWarehouseView($this);
					$addNewWarehouse.find('section.tabs').removeClass('tabs').find('li').removeClass('checked');
					initTabs();
					
					require(["components/provider-registration"], function(Reg) {
						Reg();
						rebindAllLoomForms($("#add-new-warehouse form.loom-form"))
					});   
				});
			});
			
			$(document).on('submit','#registration',function(e){
				var $tab = $('ul.tabs a:nth-child(2) li.four.columns');
				var clickedTab = $tab.parent('a').attr('href');
				$('.tab-content ' + clickedTab).show().siblings().hide();
				$tab.addClass('active').parent().siblings('a').find('li').removeClass('active');
				$('#add-new-warehouse ul a li:first-child').addClass('checked');
				rebuildWarehouseList();
				rebuildWarehouseDropdownList();
				e.preventDefault();
			});
			
			$(document).on('submit','#define-space',function(e){
				var $tab = $('ul.tabs a:nth-child(3) li.four.columns')
				var clickedTab = $tab.parent('a').attr('href');
				$('.tab-content ' + clickedTab).show().siblings().hide();
				$tab.addClass('active').parent().siblings('a').find('li').removeClass('active');
				$('#add-new-warehouse ul a li:nth-child(2)').addClass('checked');
				e.preventDefault();
				rebuilPricingAndAvailability();
			});
			
			$(document).on('click', '.form-footer .back', function(){
				var $currTab = $('ul.tabs a li.four.columns.active')
				var $goToTab = $currTab.parent().prev('a');
				var goToTabHref = $goToTab.attr('href');
				$('.tab-content ' + goToTabHref).show().siblings().hide();
				$goToTab.find('li').addClass('active').parent().siblings('a').find('li').removeClass('active');
			});
			
			$(document).on('click','#define-space .save',function(e){
				rebuilPricingAndAvailability();
				changeToDisplayMode($('div[data-view="warehouses"]'));
			});
			
			$(document).on('click','#registration .save',function(e){
				rebuildWarehouseList();
				rebuildWarehouseDropdownList();
				changeToDisplayMode($('div[data-view="warehouses"]'));
			});
			
			$(document).on('click','#save-and-finish',function(e){
				changeToDisplayMode($('div[data-view="warehouses"]'));
			});
			
		}
		
		function rebuilPricingAndAvailability(){
			DBCntr.rebuildPricingAndAvailability($('input[name="warehouse_id"]').val(),function(response){
				$("#step-3").empty();
				$("#step-3").append($(response));
				rebindAllLoomForms($("#add-new-warehouse form.loom-form"))
			});
		}
		
		function rebindAllLoomForms($id){
			$id.each(function(){//Rebind loom with all the warehouse forms
				loom.rebind($(this));
			});
		}
		
		function rebuildWarehouseList(){
			DBCntr.rebuildWarehouseList(function(response){
				var $warehouseTable = $('div[data-view="warehouses"] #warehouses-table');
				var $addNewWarehouseContainer = $('.add-new-warehouse-container');
				$warehouseTable.parent().append(response);
				$warehouseTable.parent().append($addNewWarehouseContainer.wrap('<p/>').parent().html());
				$warehouseTable.remove()[0];
				$addNewWarehouseContainer.remove()[0];
			});
		}
		
		function rebuildWarehouseDropdownList(){
			DBCntr.rebuildWarehouseDropdownList(function(response){
				var $warehouseContactsDDParent = $('#warehouse-contacts').parent();
				$warehouseContactsDDParent.find('#warehouse-contacts').remove();
				$warehouseContactsDDParent.append(response);
				initContactsTab();
			});
		}
		
		function goToLinkViewTab(link){
			var links = link.split('#');
			goToView('#' + links[1]);
			goToTab('#' + links[2]);
		}
		
		function goToView(href){
			$('div[data-view="warehouses"]').find('.content-box[data-content="warehouses"]').show();
			$('#view-edit-warehouse').find('.row').remove();
			$('#add-new-warehouse').find('.row').remove();
			if (currentView !== "") backLinks.push(currentView);
			currentView = href;
			var $corrView = $('div[data-view="' + href.replace('#','') +'"]');
			$corrView.show().siblings('.dashboard-container').hide();
		}
		
		function goToTab(href){
			$('.tab-content ' + href).show().siblings().hide();
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
				goToView($this.attr('href'));
				$this.parent('li').parent('ul').parent('#vertical-nav').parent('.main').css('background-color','#d7d7d7');
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
				goToTab($this.attr('href'));
				$this.find('li').addClass('active').parent().siblings().find('li').removeClass('active');
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
					templateId = $this.closest('.tab.main').data('contact-type') + '-row',
					template = templates.getTemplate(templateId),
					row = template.bind({});
					$this.parent('div').prev('button[name="save-new-contacts"]').show();
					$(row).find('td:first-of-type').html($this.parent('div').parent('.button-container').prev('table').find('tbody tr').length + 1 + '*');
					$this.closest('.button-container').siblings('table').find('tbody').append(row);
			});
			
			$(document).on('click', 'button[name="resend-email"]',function(){
				var $this = $(this),
				data = {},
				contactType = $this.closest('div.tab.main').attr('id').replace(/-([a-z])/g, function (g) { return ' ' + g[1].toUpperCase(); });
				contactType = contactType.charAt(0).toUpperCase() + contactType.substring(1);
				
				data.role = contactType;
				data.email = $this.parent('td').siblings('td[data-field="email"]').html();
				
				DBCntr.resendRegisterEmail($this.parent('td').parent('tr').data('user-id'),data,function(result){
					if(result.err === true){
						Alerts.showPersistentErrorMessage('Error: Email not sent');
					}else{
						$this.parent('td').siblings('td[data-field="register-status"]').find('div').removeClass('expired').addClass('pending');
						$this.remove();
						Alerts.showSuccessMessage('Success: Email resent');
					}
				});
			})
			
			$(document).on('click','button[name="save-new-contacts"]',function(){
				var $this = $(this),
					contactType = $this.parent('div').parent('div').attr('id').replace(/-([a-z])/g, function (g) { return ' ' + g[1].toUpperCase(); }),
					data = {},
					rows = [],
					cbDone = 0,
					error = false;
					
					contactType = contactType.charAt(0).toUpperCase() + contactType.substring(1);
					
					rows = $this.parent('div').siblings('table').find('tr[data-status="new"]');
					data.warehouseContacts = $this.closest('.warehouse-specific-contacts').data('warehouse-contacts') || "";
					data.role = contactType;
					data.warehouseId = $('select[name="warehouses"]').find(":selected").data('id');
					for (var i = 0; i<rows.length; i++){
						data.email = $(rows[i]).find('td[data-field="email"]').find('input').val();
						data.name = $(rows[i]).find('td[data-field="name"]').find('input').val();
						data.phoneNumber = $(rows[i]).find('td[data-field="phone-number"]').find('input').val();
						data.dashboardAccess = $(rows[i]).find('tr[data-status="new"]').find('td[data-field="dashboard-access"]').find('input').val();
						DBCntr.createContact(data,function(response){
							cbDone ++;
							if(response.error === true){
								error = true;
							}else if(response.data !== undefined){
								var contactsId = response.data._id.toString();
							}
							if (cbDone === rows.length){
								if(error === true){
									Alerts.showPersistentErrorMessage('Not all contacts have been added');
								}else{
									$this.parent('div').parent('div').attr('data-warehouse-contacts',contactsId);
									Alerts.showSuccessMessage('All contacts have been successfully added');
									rowInputsToText(rows);
								}
							}
						});
					}
			});
		}
		
		function rowInputsToText(rows){
			for (var i = 0; i<rows.length; i++){
				$(rows[i]).removeAttr('data-status');
				$(rows[i]).find('td[data-field="email"]').html($(rows[i]).find('td[data-field="email"]').find('input').val());
				$(rows[i]).find('td[data-field="name"]').html($(rows[i]).find('td[data-field="name"]').find('input').val());
				$(rows[i]).find('td[data-field="phone-number"]').html($(rows[i]).find('td[data-field="phone-number"]').find('input').val());
			}
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