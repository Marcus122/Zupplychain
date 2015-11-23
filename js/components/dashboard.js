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
			
		if(window.location.pathname === '/dashboard'){
			initNavEvents();
			initTabs();
			triggerHashClick();
			initAccountTab();
			initWarehouseTab();
			initPaging($('table[data-type="warehouses-table"]'));
		}
			initTrayBehaviour();
			initContactsTab();
		
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
		
		function scrollToPos(eleString,options){
			$.scrollTo(eleString,options); 
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
							addEmptyRowsToTables(["master-contact","availability-controller","enquires-controller","transport-coordinator","goods-in","picking-dispatch","invoice-controller","credit-controller"]);//Attempt to add empty rows to all tables if they are there.
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
			$tab.find('label').removeAttr('disabled');
			$tab.find('div[data-function="save-buttons"]').removeClass('hidden');
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
			$tab.find('label').attr('disabled','disabled');
			$tab.find('div[data-function="save-buttons"]').addClass('hidden');
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
					$warehouseContainer.removeClass('hidden');
					initTabs();
					prepareWarehouseView($this);
					$warehouseContainer.find('input').prop('disabled',true);
					$warehouseContainer.find('button').prop('disabled',true);
					$warehouseContainer.find('textarea').prop('disabled',true);
					$warehouseContainer.find('select').prop('disabled',true);
					$warehouseContainer.find('.form-footer div[data-function="save-buttons"]').addClass('hidden');
					
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
					$addNewWarehouse.removeClass('hidden');
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
					var $tab = $('ul.tabs li:nth-child(2).four.columns')
					var clickedTab = $tab.find('a').attr('href');
					$('.tab-content ' + clickedTab).removeClass('hidden').siblings().addClass('hidden');
					$tab.addClass('active').siblings('li').removeClass('active');
					$('#add-new-warehouse ul li:first-child').addClass('checked');
					rebuildWarehouseList();
					rebuildWarehouseDropdownList();
					e.preventDefault();
				}
			});
			
			$(document).on('submit','#define-space',function(e){
				var $tab = $('ul.tabs li:nth-child(3).four.columns')
				var clickedTab = $tab.find('a').attr('href');
				$('.tab-content ' + clickedTab).removeClass('hidden').siblings().addClass('hidden');
				$tab.addClass('active').siblings('li').removeClass('active');
				$('#add-new-warehouse ul li:nth-child(2)').addClass('checked');
				e.preventDefault();
				rebuilPricingAndAvailability();
			});
			
			$(document).on('click', '.form-footer .back', function(){
				var $currTab = $('ul.tabs a li.four.columns.active')
				var $goToTab = $currTab.parent().prev('a');
				var goToTabHref = $goToTab.attr('href');
				$('.tab-content ' + goToTabHref).removeClass('hidden').siblings().addClass('hidden');
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
				$('div[data-one-warehouse="true"]').removeClass('hidden');
			});
			
			$(document).on('click','a[href="#master-contact"]',function(){
				$('div[data-one-warehouse="true"]').addClass('hidden');
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
			$('a[href="#' + links[2] + '"]').parent('li').addClass('active').siblings('li').removeClass('active');
			$('.warehouse-specific-contacts').addClass('hidden');
			if(links[3]){
				$('select[name="warehouses"]').val($('select[name="warehouses"]').find('option[data-id="' + $this.closest('table').data('warehouse-id') + '"]').val());
				$('button[name="view-warehouse-contacts"]').trigger('click',function(){
					goToTab('#' + links[3]);
					$('a[href="#' + links[3] + '"]').parent('li').addClass('active').siblings('li').removeClass('active');
					scrollToPos('.warehouse-specific-contacts'); 
				});
			}
		}
		
		function goToView(href){
			$('div[data-view="warehouses"]').find('.content-box[data-content="warehouses"]').removeClass('hidden');
			$('#view-edit-warehouse').find('.row').remove();
			$('#add-new-warehouse').find('.row').remove();
			currentView = href;
			if (currentView !== "" && !determineIfViewInBackLinks(currentView)) backLinks.push(currentView);
			var $corrView = $('div[data-view="' + href.replace('#','') +'"]');
			$corrView.removeClass('hidden').siblings('.dashboard-container').addClass('hidden');
		}
		
		function goToTab(href){
			$('.tab-content ' + href + ',div[data-content="' + href.replace('#','') + '"]').removeClass('hidden').siblings().addClass('hidden');
		}
		
		function prepareWarehouseView($this){
			var $viewEditButtons = $('.view-edit-buttons');
			$this.closest('div[data-view="warehouses"]').find('.content-box[data-content="warehouses"]').addClass('hidden');
			$this.closest('.dashboard-container').parent('.main').css('background-color','initial');
			//$this.closest('div[data-view="warehouses"]').find('input[type="date"]').datepicker().removeClass('hidden');
			loom = new Loom();
			if($this.data('action') === ACTION_ADD_NEW_WAREHOUSE){
				$viewEditButtons.addClass('hidden').addClass('hidden');
			}else if($this.data('action') === ACTION_VIEW_EDIT_WAREHOUSE){
				$viewEditButtons.removeClass('hidden');
			}
		}
		
		function initNavEvents(){
			function minimiseDashboardNav($navThatWasClicked){
				$navThatWasClicked.closest('#vertical-nav').addClass('minimised');
				$navThatWasClicked.removeClass('minimise-dashboard-nav');
				$navThatWasClicked.addClass('maximise-dashboard-nav');
				$('.dashboard-container').removeClass('nine');
				$('.dashboard-container').addClass('eleven');
			}
			$(document).on('click','li.minimise-dashboard-nav',function(){
				minimiseDashboardNav($(this));
			});
			$(document).on('click','li.maximise-dashboard-nav',function(){
				var $this = $(this);
				$this.closest('#vertical-nav').removeClass('minimised');
				$this.removeClass('maximise-dashboard-nav');
				$this.addClass('minimise-dashboard-nav');
				$('.dashboard-container').removeClass('eleven');
				$('.dashboard-container').addClass('nine');
			});
			$('#vertical-nav ul li a, a.tile-button').click(function(){
				var $this = $(this);
				var $li;
				goToView($this.attr('href'));
				$li = $this.parent('li')
				if($li.length === 0){
					$li = $('a[href="' + $this.attr('href') + '"]').parent('li');
				}
				$li.parent('ul').parent('#vertical-nav').parent('.main').css('background-color','#d7d7d7');
				$li.addClass('active').siblings().removeClass('active');
				scrollToPos('body');
				minimiseDashboardNav($('li.minimise-dashboard-nav'));
				if(backLinks.length > 1){
					$('.dashboard-back').removeClass('hidden');
				}
			});
			$('.dashboard-back').click(function(){
				var length = backLinks.length;
				var $this = $(this);
				$($this.parent('.container').parent('.form-footer').prev('section').find('.main')[0]).css('background-color','#d7d7d7');
				if (length > 0){
					var $corrView = $('div[data-view="' + backLinks[length-2].replace('#','') +'"]');
					$corrView.removeClass('hidden').siblings('.dashboard-container').addClass('hidden');
					if ($('#vertical-nav ul li a[href="' + backLinks[length-2] + '"]').length > 0){
						$('#vertical-nav ul li a[href="' + backLinks[length-2] + '"]').parent('li').addClass('active').siblings().removeClass('active');
					}else{
						$('li.active').removeClass('active');
					}
					backLinks.splice(length-1,1);
					if (backLinks.length === 0){
						backLinks.push("#main");
						$this.addClass('hidden');
					}else if(backLinks.length === 1){
						$this.addClass('hidden');
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
				if($this.parent().siblings('li.active').data('validate-form') === undefined || loom.isFormValid($this.parent('li').siblings('li.active').data('validate-form'))){
					goToTab($this.attr('href'));
					$this.parent('li').addClass('active').siblings().removeClass('active');
					e.preventDefault();
				}else{
					loom.focusOnInvalidField($this.parent().siblings('li.active').data('validate-form'));
				}
			});
			
			$(document).on('click','div[data-view="contacts"] .tabs ul.tabs a',function(){//contacts specific stuff
				var $this = $(this);
				if($this.attr('href') === '#warehouse-contacts' && $('div[data-one-warehouse="true"]').length > 0){
					$('div[data-one-warehouse="true"]').removeClass('hidden');
					$('.warehouse-specific-contacts').removeClass('hidden');
				}else if($this.attr('href') === '#master-contact'){
					$('div[data-one-warehouse="true"]').addClass('hidden');
				}
				
				if($this.attr('href') === '#master-contact'){
					$('.warehouse-specific-contacts').addClass('hidden');
				}
			});
		}
		
		function initContactsTab(){
			var COMPULSORY_CONTACTS = 2;
			var numberSuffix = ["st","nd","rd"];
			initDelete();
			loom.rebind($('form[data-form-type="contacts-form"]'))
			if ($('#warehouse-contacts').hasClass('active')){
				$('#warehouse-contacts').removeClass('hidden');
			}
			addEmptyRowsToTables(["master-contact","availability-controller","enquires-controller","transport-coordinator","goods-in","picking-dispatch","invoice-controller","credit-controller"]);//Attempt to add empty rows to all tables if they are there.
			
			$('a[data-action="go-to-matrix"]').click(function(e){
				e.preventDefault();
				scrollToPos($(this).attr('href'),{offset:{top:-100},margin:true}); 
			});
			
			$(document).on('keyup','form[data-form-type="contacts-form"] table tbody tr td[data-field="name"] input',function(){
				var $this = $(this);
				var uniqueContacts = [];
				var results = {};
				var emails = [];
				if($this.val().length >=3 && $this.closest('table').closest('div').data('contact-type') !== 'master-contact'){
					var data = {};
					data.query = $this.val();
					DBCntr.getWarehouseContactsSuggestions($('select[name="warehouses"]').find(":selected").data('id') || $(this).closest(".warehouse-tasks-tray").parent().closest(".warehouse-tasks-tray").data('warehouse-id'),data,function(result){
						results.data = result;
						$.each(results.data.data,function(index,value){
							if($.inArray(value.email,emails)===-1){
								uniqueContacts.push(value);
								emails.push(value.email)
							}
						})
						displayWCSuggestionsDropdown(uniqueContacts,$this);
					});
				}
			});
			
			$(document).on('click','button[name="view-warehouse-contacts"]',function(e,cb){
				var $this = $(this);
				$('.warehouse-specific-contacts').remove();
				DBCntr.getWarehouseContacts($(this).prev('select').find(':selected').data('id'),function(result){
					if(result.err === true){
						Alerts.showPersistentErrorMessage(result.data);
					}else{
						$this.closest('div[data-view="contacts"]').append(result);
						initTabs();
						loom.rebind($('form[data-form-type="contacts-form"]'));
						addEmptyRowsToTables(["availability-controller","enquires-controller","transport-coordinator","goods-in","picking-dispatch","invoice-controller","credit-controller"]);//Add empty rows to any tables that have just appeared.
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
						$this.parent('div').prev('button[name="save-new-contacts"]').removeClass('hidden');
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
				contactType = $this.closest('div.tab.main').data('content').replace(/-([a-z])/g, function (g) { return ' ' + g[1].toUpperCase(); });
				contactType = contactType.charAt(0).toUpperCase() + contactType.substring(1);
				
				data.role = contactType;
				data.email = $this.parent('td').siblings('td[data-field="email"]').html();
				
				DBCntr.resendRegisterEmail($this.parent('td').parent('tr').data('id'),data,function(result){
					if(result.err === true){
						Alerts.showPersistentErrorMessage('Error: Email not sent');
					}else{
						$this.parent('td').siblings('td[data-field="register-status"]').find('p').removeClass('expired').addClass('pending').html('Pending');
						$this.remove();
						Alerts.showSuccessMessage('Success: Email resent');
					}
				});
			})
			
			$(document).on('click','button[name="save-new-contacts"]',function(){
				var $this = $(this),
					contactType = $this.parent('div').parent('form').parent('div').data('content').replace(/-([a-z])/g, function (g) { return ' ' + g[1].toUpperCase(); }),
					data = {},
					cbDone = 0,
					contactsToAdd = 0,
					error = false,
					currentRows = [],
					$table = $this.parent('div').siblings('table'),
					rows = $table.find('tr[data-status="new"]'),
					shouldIgnore,
					skippedRows = [];
					
					for (var i = 0; i<rows.length; i++){
						shouldIgnore = shouldIgnoreThisRow($(rows[i]));
						if(shouldIgnore){
							markRowToBeSkipped($(rows[i]));
							skippedRows.push(rows[i]);
							loom.rebind($this.closest('form').attr('id'));
						}
					}
					if(loom.isFormValid($this.closest('form').attr('id'))){
						contactType = contactType.charAt(0).toUpperCase() + contactType.substring(1);
						
						
						data.warehouseContacts = $this.closest('.warehouse-specific-contacts').data('warehouse-contacts') || $this.closest(".warehouse-tasks-tray").parent().closest(".warehouse-tasks-tray").data('warehouse-contacts') || "";
						data.role = contactType;
						data.roleCC = $(this).closest('.tab-content').prev('.tabs').find('li.active').find('a').attr('href') || $this.closest(".tray.open").prev('a').attr('href');
						data.roleCC = data.roleCC.replace('#','').replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
						data.warehouseId = $('select[name="warehouses"]').find(":selected").data('id') || $this.closest(".warehouse-tasks-tray").parent().closest(".warehouse-tasks-tray").data('warehouse-id');
						data.warehouseName = $('select[name="warehouses"]').find(":selected").val() || $this.closest(".warehouse-tasks-tray").parent().closest(".warehouse-tasks-tray").data('warehouse-name');
						for (var i = 0; i<rows.length; i++){
							if($(rows[i]).find(".loom-ignore").length === 0){
								data.email = $(rows[i]).find('td[data-field="email"]').find('input').val();
								data.name = $(rows[i]).find('td[data-field="name"]').find('input').val();
								if((data.email !== undefined && data.email !== "") && (data.name !== undefined && data.name !== "")){
									contactsToAdd ++;
									data.phoneNumber = $(rows[i]).find('td[data-field="phone-number"]').find('input').val();
									data.dashboardAccess = $(rows[i]).find('tr[data-status="new"]').find('td[data-field="dashboard-access"]').find('input').val();
									currentRows.push($(rows[i]));
									DBCntr.createContact(data,function(response){
										cbDone ++;
										if(response.error === true){
											error = true;
										}else if(response.data.contactId !== undefined){
											var contactsId = response.data.contactId;
										}
										
										if(response.data.expiry === null){
											currentRows[cbDone-1].find('td[data-field="register-status"]').append('<p class="registered-status complete">Registered</p>');
										}else{
											currentRows[cbDone-1].find('td[data-field="register-status"]').append('<p class="registered-status pending">Pending</p>');
										}
										
										currentRows[cbDone-1].attr('data-id',response.data.userId);
										currentRows[cbDone-1].attr('data-values-added',"true");
										currentRows[cbDone-1].attr('data-empty',"false");
										if (cbDone === contactsToAdd){
											if(error === true){
												Alerts.showPersistentErrorMessage('Not all contacts have been added');
											}else{
												$this.parent('div').parent('div').attr('data-warehouse-contacts',contactsId);
												Alerts.showSuccessMessage('All contacts have been successfully added',{centre:true});
												rowInputsToText(rows);
												for (var i = 0; i<skippedRows.length; i++){
													unmarkRowsToBeSkipped($(skippedRows[i]));
												}
												loom.rebind($this.closest('form').attr('id'));
												if($table.data('max-rows') === $table.find('tbody').find('tr[data-empty="false"]').length){
													$this.parent().addClass('hidden');
												}
											}
										}
									});
								}
							}
						}
					}else{
						loom.focusOnInvalidField($this.closest('form').attr('id'));
					}
			});
			
			function initDelete(){
				
				function hideDeleteShowSave($btnContanier){
					$btnContanier.removeClass('hidden');
					$btnContanier.find('button').removeClass('hidden');
					$btnContanier.find('a').removeClass('hidden');
					$btnContanier.find('label').removeClass('hidden');
					$btnContanier.find('button[name="delete"]').addClass('hidden');
				}
				
				function showDeleteHideSave($btnContanier){
					$btnContanier.removeClass('hidden');
					$btnContanier.find('button').addClass('hidden');
					$btnContanier.find('a').addClass('hidden');
					$btnContanier.find('label').addClass('hidden');
					$btnContanier.find('button[name="delete"]').removeClass('hidden');
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
							$btnContanier.addClass('hidden');
						}
					}
				});
				
				function addWarehouseContactRow($ele){
					var template = templates.getTemplate('warehouse-specific-contacts-row');
					var $row = template.bind({});
					$ele.append($row);
				}
				
				$(document).on('click','button[name="delete"]',function(){
					var $this = $(this);
					var $table = $this.parent().prev('.dashboard-table');
					var $rows = $table.find('tbody').find('tr');
					var data = {};
					var ids = [];
					var deletedRows = [];
					var $currentRow;
					var cbCompleted = 0;
					var rowNum = 0;
					var err = false;
					var len = 0;
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
					len = $rows.find('td[data-field="delete"]').find('input[type="checkbox"]:checked').length;
					for (var i = 0; i<$rows.length; i++){
						$currentRow = $($rows[i]);
						if ($($rows[i]).find('td[data-field="delete"]').find('input').is(':checked')){
							ids.push($($rows[i]).data('id'));
							deletedRows.push($rows[i]);
							data.id = $($rows[i]).data('id');
							DBCntr.deleteItems(data,function(response){
								cbCompleted ++;
								if (response.err){
									//Alerts.showPersistentErrorMessage('Error: One or more of the selected items were not deleted');
									err = true;
								}
								//else{
									//Alerts.showSuccessMessage('Items deleted');
								//}
								// for (var j= 0; j<deletedRows.length; j++){
								// 	deletedRows[j].remove();
								// }
								// if($this.parent().prev('.dashboard-table').find('tbody').find('tr').length === 0){
								// 	addWarehouseContactRow($table.find('tbody'));
								// }
								//$rows[i].remove();
								if(cbCompleted === len){
									for (var j= 0; j<deletedRows.length; j++){
										deletedRows[j].remove();
									}
									$rows = $table.find('tbody').find('tr');
									for(var k = 0; k<$rows.length; k++){
										if(parseInt($($($rows[k]).find('td')[0]).html().replace('*','')) !== k){
											rowNum = k+1;
											$($($rows[k]).find('td')[0]).html(rowNum+numberSuffix[rowNum]+'*');
										}
									}
									addEmptyRowsToTables([$this.closest('form').parent('div').data('content')]);
									hideDeleteShowSave($table.next('.button-container'));
									if(err===true){
										Alerts.showPersistentErrorMessage('Error: One or more of the selected items were not deleted');
									}else{
										Alerts.showSuccessMessage('Items deleted');
									}
								}
							});
						}
					}
				});
			}
		}
		
		function addEmptyRowsToTables(contactTypes){
			var $table;
			var template;
			var $row;
			var rowNum;
			var numOfRows;
			var num;
			var COMPULSORY_CONTACTS = 2;
			var numberSuffix = ["st","nd","rd"];
			for (var i = 0; i<contactTypes.length; i++){
				$table = $('div[data-content="' + contactTypes[i] + '"]').find('table');
				numOfRows = $table.find('tbody tr').length;
				for (var j = 0; j<parseInt($table.data('max-rows'))-numOfRows; j++){
					template = templates.getTemplate($('div[data-content="' + contactTypes[i] + '"]').data('contact-type') + '-row');
					rowNum = $table.find('tbody tr').last().find('td').first().html() || '0*';
					rowNum = parseInt(rowNum.replace('*',''));
					rowNum ++;
					num = rowNum.toString();
					num = num + numberSuffix[parseInt(num)-1];
					if(rowNum<=COMPULSORY_CONTACTS){
						num = num + '*'
					}
					$row = template.bind({num:num});
					if(rowNum>COMPULSORY_CONTACTS){
						$row.find('input').removeAttr('required')
					}
					$table.append($row)
				}
			}
		}
		
		function rowInputsToText(rows){
			for (var i = 0; i<rows.length; i++){
				if($(rows[i]).data("values-added") === true){
					$(rows[i]).removeAttr('data-status');
					$(rows[i]).find('td[data-field="email"]').html($(rows[i]).find('td[data-field="email"]').find('input').val() || "N/A");
					$(rows[i]).find('td[data-field="name"]').html($(rows[i]).find('td[data-field="name"]').find('input').val() || "N/A");
					$(rows[i]).find('td[data-field="phone-number"]').html($(rows[i]).find('td[data-field="phone-number"]').find('input').val() || "N/A");
					if($(rows[i]).find('td[data-field="email"]').html() !== $('.user-links').find('a').html()){
						$(rows[i]).find('td[data-field="delete"]').append('<input type="checkbox" name="delete"/>');
					}
					$(rows[i]).find('td').removeClass('success');
				}
			}
		}
		
		function initTrayBehaviour(){
			$(document).on("click", ".warehouse-tasks-tray .open-tray-link", function(evt){
				openTray($(this));
				if(evt.stopPropagation) evt.stopPropagation();
				if(evt.cancelBubble!=null) evt.cancelBubble = true;
				evt.preventDefault();
			});
			
			function openTray($linkThatWasClicked) {
				$($linkThatWasClicked.parent().find(".tray")[0]).toggleClass("open");
				$linkThatWasClicked.toggleClass("open");
				$($linkThatWasClicked.parent().find(".tray")[0]).find('div.main').removeClass('hidden');
				//scrollToPos('.trays');
        	}
		}
		
		function displayWCSuggestionsDropdown(data,$this){
			var $dropdown = $this.next('ul');
			$dropdown.find('li').remove();
			$dropdown.width($this.outerWidth()-2);
			var template = templates.getTemplate("contacts-suggestion");
			for (var i = 0; i<data.length; i++){
				var $listItem = template.bind(data[i]);
				$dropdown.append($listItem);
			}
			$dropdown.removeClass('hidden');
			//$dropdown.slideToggle(200);
		}
		
		$(document).on('click','ul[data-action="suggestions-dropdown"] a',function(e){
			e.preventDefault();
			var $this = $(this);
			$this.closest('td').siblings('td[data-field="email"]').find('input').val($this.data('email'));
			$this.parent().parent().siblings('input[name="name"]').val($this.html());
			$this.closest('td').siblings('td[data-field="phone-number"]').find('input').val($this.data('phone-number'));
			$this.closest('ul').empty();
			$this.closest('ul').addClass('hidden');
		});
		
		$(document).click(function(){
			var $this = $('ul[data-action="suggestions-dropdown"]');
			if($this.is(":visible")){
				$this.closest('ul').empty();
				//$this.slideUp();
				$this.closest('ul').addClass('hidden');
			}
		});
	}
	
	function shouldIgnoreThisRow($tr){
		var inputs = $($tr).find("input");
		for (var i=0; i<inputs.length; i++){
			if($(inputs[i]).val() !== ""){
				return false;
			}
		}
		return true;
	}
	
	function markRowToBeSkipped($tr){
		$($tr).find(".input-field").addClass("loom-ignore");
		$($tr).addClass("skipThisRow");
	}
	
	function unmarkRowsToBeSkipped($tr){
		$($tr).find(".input-field").removeClass("loom-ignore");
		$($tr).removeClass("skipThisRow");
	}
	return Class;
});