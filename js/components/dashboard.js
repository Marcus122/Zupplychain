define(["jquery","loom/loom","loom/loomAlerts","controllers/dashboard","templates/templates","jqueryPlugins/jquery.scrollTo.min"], function ($,Loom,Alerts,DBCntr,Templates,Scroll) {
	
    function Class() {
		var templates = new Templates();
		var ACTION_ADD_NEW_WAREHOUSE = "add-new-warehouse";
		var ACTION_VIEW_EDIT_WAREHOUSE = "view-edit-warehouse";
		var loom = new Loom(),
			firstLink = window.location.href.split('#')[1] || 'main',
			backLinks = ['#'+firstLink],
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
		initDelete();
		initPaging($('table[data-type="warehouses-table"]'));
		initTrayBehaviour();
		
		loom.addOnSuccessCallback("login-form", function(response){
			if (response.data.err){
				Alerts.showPersistentErrorMessage(response.data.err);
			}else{
				window.location.href = '/dashboard';
			}
        });
		
		function triggerHashClick(){
			var hash = $.trim(window.location.hash);
			if(hash) $('a[href$="' + hash + '"]').trigger('click');
		}
		
		$(document).on('click','a[data-go-to-link="view-tab-contacts"]',function(){
			goToLinkViewTabContacts($(this));
		});
		
		function scrollToPos(eleString){
			$.scrollTo(eleString); 
		}
		
		function initDelete(){
			
			function hideDeleteShowSave($btnContanier){
				$btnContanier.show();
				$btnContanier.find('button').show();
				$btnContanier.find('a').show();
				$btnContanier.find('label').show();
				$btnContanier.find('button[name="delete"]').hide();
			}
			
			function showDeleteHideSave($btnContanier){
				$btnContanier.show();
				$btnContanier.find('button').hide();
				$btnContanier.find('a').hide();
				$btnContanier.find('label').hide();
				$btnContanier.find('button[name="delete"]').show();
			}
			
			$(document).on('change','input[name="delete"]',function(){
				var $this = $(this);
				var $table = $this.closest('table');
				var $btnContanier = $table.next('.button-container');
				var maxRows = $table.data('max-rows');
				if($table.find('td[data-field="delete"]').find('input:checked').length > 0){
					showDeleteHideSave($btnContanier);
				}else{
					if(maxRows > $table.find('tbody').find('tr').length){
						hideDeleteShowSave($btnContanier);
					}else{
						$btnContanier.hide();
					}
				}
			});
			
			$(document).on('click','button[name="delete"]',function(){
				var $this = $(this);
				var $table = $this.parent().prev('.dashboard-table');
				var $rows = $table.find('tbody').find('tr');
				var data = {};
				var ids = [];
				var deletedRows = [];
				var rowNum = 0;
				data.type = $table.parent('form').parent('div').data('data') ||
							$table.parent('form').parent('div').data('contact-type');
				data.type = data.type.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); })
				data.subType = $table.parent('form').parent('div').data('content').replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });//Specific contact type (e.g. Availability Controller)
				data.company = $table.parent('form').parent('div').data('company-id');
				if(data.company !== undefined){
					data.company = data.company.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
				}
				data.warehouseContactId = $('.warehouse-specific-contacts').data('warehouse-contacts');
				if(data.warehouseContactId !== undefined){
					data.warehouseContactId = data.warehouseContactId.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); })
				}
				for (var i = 0; i<$rows.length; i++){
					if ($($rows[i]).find('td[data-field="delete"]').find('input').is(':checked')){
						ids.push($($rows[i]).data('id'));
						deletedRows.push($rows[i]);
					}
				}
				data.ids = ids;
				DBCntr.deleteItems(data,function(response){
					if (response.err){
						Alerts.showPersistentErrorMessage('Error: One or more of the selected items were not deleted');
					}else{
						Alerts.showSuccessMessage('Items deleted');
					}
					for (var j= 0; j<deletedRows.length; j++){
						deletedRows[j].remove();
					}
					if($this.parent().prev('.dashboard-table').find('tbody').find('tr').length === 0){
						addWarehouseContactRow($table.find('tbody'));
					}
					$rows = $table.find('tbody').find('tr');
					for(var k = 0; k<$rows.length; k++){
						if(parseInt($($($rows[k]).find('td')[0]).html().replace('*','')) !== k){
							rowNum = k+1;
							$($($rows[k]).find('td')[0]).html(rowNum+'*');
						}
					}
					hideDeleteShowSave($table.next('.button-container'));
				});
			});
			
			function addWarehouseContactRow($ele){
				var template = templates.getTemplate('warehouse-specific-contacts-row');
				var $row = template.bind({});
				$ele.append($row);
			}
		}
		
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
			$tab.find('input[data-clear-on-edit-mode="true"]').each(function(){
				$(this).val("")
			});
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
			$tab.find('input[data-populate-on-display-mode]').each(function(){
				$(this).val($(this).data('populate-on-display-mode'));
			});
		}
		
		function initWarehouseTab(){
			
			$(document).on('click','table[data-type="warehouses-table"] tbody tr td .button',function(e){
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
				var $tab = $this.closest('[data-view-edit-capture-zone="true"]')
				if (!$this.hasClass('down')){
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
				if( loom.isFormValid($(this).attr('id')) ){
					var $tab = $('ul.tabs a:nth-child(2) li.four.columns');
					var clickedTab = $tab.parent('a').attr('href');
					$('.tab-content ' + clickedTab).show().siblings().hide();
					$tab.addClass('active').parent().siblings('a').find('li').removeClass('active');
					$('#add-new-warehouse ul a li:first-child').addClass('checked');
					rebuildWarehouseList();
					rebuildWarehouseDropdownList();
					e.preventDefault();
				}
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
				if($(this).closest('form').find('.error').length === 0){
					changeToDisplayMode($('div[data-view="warehouses"]'));
				}
			});
			
			$(document).on('click','#save-and-finish',function(e){
				changeToDisplayMode($('div[data-view="warehouses"]'));
			});
			
			$(document).on('click','a[href="#warehouse-contacts"]',function(){
				$('div[data-one-warehouse="true"]').show();
			});
			
			$(document).on('click','a[href="#master-contact"]',function(){
				$('div[data-one-warehouse="true"]').hide();
			});
			
		}
		
		function rebuilPricingAndAvailability(){
			DBCntr.rebuildPricingAndAvailability($('input[name="warehouse_id"]').val(),function(response){
				$("#step-3").empty();
				$("#step-3").append($(response));
				rebindAllLoomForms($("#add-new-warehouse form.loom-form"))
				rebindAllLoomForms($("#view-edit-warehouse form.loom-form"))
			});
		}
		
		function rebindAllLoomForms($id){
			$id.each(function(){//Rebind loom with all the warehouse forms
				loom.rebind($(this));
			});
		}
		
		function rebuildWarehouseList(){
			DBCntr.rebuildWarehouseList(function(response){
				var $warehouseTable = $('div[data-view="warehouses"] table[data-type="warehouses-table"]');
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
		
		function determineIfViewInBackLinks(view){
			for (var i = 0; i<backLinks.length; i++){
				if (backLinks[i] === view){
					return true;
				}
			}
			return false;
		}
		
		function goToLinkViewTabContacts($this){
			var links = $this.attr('href').split('#');
			goToView('#' + links[1]);
			goToTab('#' + links[2]);
			$('a[href="#' + links[2] + '"]').find('li').addClass('active').parent().siblings().find('li').removeClass('active');
			$('select[name="warehouses"]').val($('select[name="warehouses"]').find('option[data-id="' + $this.closest('table').data('warehouse-id') + '"]').val());
			$('button[name="view-warehouse-contacts"]').trigger('click',function(){
				goToTab('#' + links[3]);
				$('a[href="#' + links[3] + '"]').find('li').addClass('active').parent().siblings().find('li').removeClass('active');
                scrollToPos('.warehouse-specific-contacts'); 
			});
		}
		
		function goToView(href){
			$('div[data-view="warehouses"]').find('.content-box[data-content="warehouses"]').show();
			$('#view-edit-warehouse').find('.row').remove();
			$('#add-new-warehouse').find('.row').remove();
			currentView = href;
			if (currentView !== "" && !determineIfViewInBackLinks(currentView)) backLinks.push(currentView);
			var $corrView = $('div[data-view="' + href.replace('#','') +'"]');
			$corrView.show().siblings('.dashboard-container').hide();
		}
		
		function goToTab(href){
			$('.tab-content ' + href + ',div[data-content="' + href.replace('#','') + '"]').show().siblings().hide();
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
			$(document).on('click','li.minimise-dashboard-nav',function(){
				var $this = $(this);
				$this.closest('#vertical-nav').addClass('minimise');
				$this.removeClass('minimise-dashboard-nav');
				$this.addClass('maximise-dashboard-nav');
				$('.dashboard-container').removeClass('nine');
				$('.dashboard-container').addClass('eleven');
			});
			$(document).on('click','li.maximise-dashboard-nav',function(){
				var $this = $(this);
				$this.closest('#vertical-nav').removeClass('minimise');
				$this.removeClass('maximise-dashboard-nav');
				$this.addClass('minimise-dashboard-nav');
				$('.dashboard-container').removeClass('eleven');
				$('.dashboard-container').addClass('nine');
			});
			$('#vertical-nav ul li a, a.tile-button').click(function(){
				var $this = $(this);
				goToView($this.attr('href'));
				$this.parent('li').parent('ul').parent('#vertical-nav').parent('.main').css('background-color','#d7d7d7');
				$this.parent('li').addClass('active').siblings().removeClass('active');
				scrollToPos('body');
				if(backLinks.length > 1){
					$('.dashboard-back').show();
				}
			});
			$('.dashboard-back').click(function(){
				var length = backLinks.length;
				var $this = $(this);
				$($this.parent('.container').parent('.form-footer').prev('section').find('.main')[0]).css('background-color','#d7d7d7');
				if (length > 0){
					var $corrView = $('div[data-view="' + backLinks[length-2].replace('#','') +'"]');
					$corrView.show().siblings('.dashboard-container').hide();
					if ($('#vertical-nav ul li a[href="' + backLinks[length-2] + '"]').length > 0){
						$('#vertical-nav ul li a[href="' + backLinks[length-2] + '"]').parent('li').addClass('active').siblings().removeClass('active');
					}else{
						$('li.active').removeClass('active');
					}
					backLinks.splice(length-1,1);
					if (backLinks.length === 0){
						backLinks.push("#main");
						$this.hide();
					}else if(backLinks.length === 1){
						$this.hide();
					}
				}else{
					window.location.href = '/';
				}
				scrollToPos('body');
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
			$(document).on('click','.tabs ul.tabs a',function(e){
				var $this = $(this);
				goToTab($this.attr('href'));
				$this.find('li').addClass('active').parent().siblings().find('li').removeClass('active');
				e.preventDefault();
			});
			
			$(document).on('click','div[data-view="contacts"] .tabs ul.tabs a',function(){//contacts specific stuff
				var $this = $(this);
				if($this.attr('href') === '#warehouse-contacts' && $('div[data-one-warehouse="true"]').length > 0){
					$('div[data-one-warehouse="true"]').show();
					$('.warehouse-specific-contacts').show();
				}else{
					$('div[data-one-warehouse="true"]').hide();
				}
				
				if($this.attr('href') === '#master-contact'){
					$('.warehouse-specific-contacts').hide();
				}
			});
		}
		
		function initContactsTab(){
			loom.rebind($('form[data-form-type="contacts-form"]'))
			$('button[name="view-warehouse-contacts"]').on('click',function(e,cb){
				var $this = $(this);
				$('.warehouse-specific-contacts').remove();
				DBCntr.getWarehouseContacts($(this).prev('select').find(':selected').data('id'),function(result){
					if(result.err === true){
						Alerts.showPersistentErrorMessage(result.data);
					}else{
						$this.closest('div[data-view="contacts"]').append(result);
						initTabs();
						loom.rebind($('form[data-form-type="contacts-form"]'))
						if(cb){
							cb();
						}
					}
				});
			});
			
			$(document).on('click','button[name="add-new-contact"]',function(){
				var $this = $(this),
					templateId = $this.closest('.tab.main').data('contact-type') + '-row',
					template = templates.getTemplate(templateId),
					row = template.bind({}),
					maxRows = 2,
					$rows = $this.closest('.button-container').siblings('table').find('tbody').find('tr'),
					mandatoryRows = 2;
					if($this.closest('.tab.active.main').data('content') === 'master-contact'){
						maxRows = 3;
					}
					
					if($rows.length < maxRows){
						$this.parent('div').prev('button[name="save-new-contacts"]').show();
						if ($rows.length < mandatoryRows){
							$(row).find('td:first-of-type').html($this.parent('div').parent('.button-container').prev('table').find('tbody tr').length + 1 + '*');
						}else{
							$(row).find('td:first-of-type').html($this.parent('div').parent('.button-container').prev('table').find('tbody tr').length + 1);
						}
						$this.closest('.button-container').siblings('table').find('tbody').append(row);
						loom.rebind($('form[data-form-type="contacts-form"]'))
					}
			});
			
			$(document).on('click', 'button[name="resend-email"]',function(){
				var $this = $(this),
				data = {},
				contactType = $this.closest('div.tab.main').attr('id').replace(/-([a-z])/g, function (g) { return ' ' + g[1].toUpperCase(); });
				contactType = contactType.charAt(0).toUpperCase() + contactType.substring(1);
				
				data.role = contactType;
				data.email = $this.parent('td').siblings('td[data-field="email"]').html();
				
				DBCntr.resendRegisterEmail($this.parent('td').parent('tr').data('id'),data,function(result){
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
					contactType = $this.parent('div').parent('form').parent('div').data('content').replace(/-([a-z])/g, function (g) { return ' ' + g[1].toUpperCase(); }),
					data = {},
					rows = [],
					cbDone = 0,
					error = false,
					$currentRow,
					$table = $this.parent('div').siblings('table');
					
					if(loom.isFormValid($this.closest('form').attr('id'))){
						contactType = contactType.charAt(0).toUpperCase() + contactType.substring(1);
						
						rows = $table.find('tr[data-status="new"]');
						data.warehouseContacts = $this.closest('.warehouse-specific-contacts').data('warehouse-contacts') || "";
						data.role = contactType;
						data.roleCC = $(this).closest('.tab-content').prev('.tabs').find('li.active').parent('a').attr('href').replace('#','').replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
						data.warehouseId = $('select[name="warehouses"]').find(":selected").data('id');
						for (var i = 0; i<rows.length; i++){
							data.email = $(rows[i]).find('td[data-field="email"]').find('input').val();
							data.name = $(rows[i]).find('td[data-field="name"]').find('input').val();
							data.phoneNumber = $(rows[i]).find('td[data-field="phone-number"]').find('input').val();
							data.dashboardAccess = $(rows[i]).find('tr[data-status="new"]').find('td[data-field="dashboard-access"]').find('input').val();
							$currentRow = $(rows[i]);
							DBCntr.createContact(data,function(response){
								cbDone ++;
								if(response.error === true){
									error = true;
								}else if(response.data.contactId !== undefined){
									var contactsId = response.data.contactId;
								}
								
								if(response.data.expiry === null){
									$currentRow.find('td[data-field="register-status"]').append('<p class="registered-status complete">Registered</p>');
								}else{
									$currentRow.find('td[data-field="register-status"]').append('<p class="registered-status pending">Pending</p>');
								}
								
								$currentRow.attr('data-id',response.data.userId);
								if (cbDone === rows.length){
									if(error === true){
										Alerts.showPersistentErrorMessage('Not all contacts have been added');
									}else{
										$this.parent('div').parent('div').attr('data-warehouse-contacts',contactsId);
										Alerts.showSuccessMessage('All contacts have been successfully added');
										rowInputsToText(rows);
										if($table.data('max-rows') === $table.find('tbody').find('tr').length){
											$this.parent().hide();
										}
									}
								}
							});
						}
					}
			});
		}
		
		function rowInputsToText(rows){
			for (var i = 0; i<rows.length; i++){
				$(rows[i]).removeAttr('data-status');
				$(rows[i]).find('td[data-field="email"]').html($(rows[i]).find('td[data-field="email"]').find('input').val() || "N/A");
				$(rows[i]).find('td[data-field="name"]').html($(rows[i]).find('td[data-field="name"]').find('input').val() || "N/A");
				$(rows[i]).find('td[data-field="phone-number"]').html($(rows[i]).find('td[data-field="phone-number"]').find('input').val() || "N/A");
				$(rows[i]).find('td[data-field="delete"]').append('<input type="checkbox" name="delete"/>');
				$(rows[i]).find('td').removeClass('success');
			}
		}
		
		function initTrayBehaviour(){
			$(document).on("click", ".tasks-box .open-tray-link", function(evt){
				openTray($(this));
				if(evt.stopPropagation) evt.stopPropagation();
				if(evt.cancelBubble!=null) evt.cancelBubble = true;
			});
			
			function openTray($linkThatWasClicked) {
				$linkThatWasClicked.parent().find(".tray").toggleClass("open");
				$linkThatWasClicked.toggleClass("open");
        	}
		}
	}
	return Class;
});