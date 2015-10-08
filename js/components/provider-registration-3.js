define(["jquery","controllers/warehouse","loom/loom","templates/templates","loom/loomAlerts"], function ($,Warehouse,Loom,Templates,Alerts) {    
    
    var lm = new Loom();
    var warehouse = {};
    var templates = new Templates();
    var lastMonday = getClosestPreviousMonday(new Date());
    var endOfNextYear = getEndOfNextYear(new Date());
    
    function getClosestPreviousMonday(inDate) {
        var dayOfWeek = inDate.getDay();
        var retDate = new Date(inDate.getTime());
            //We 'pull' the start day back to the closest monday.
        if (dayOfWeek > 1) {
            addDays(retDate, -(dayOfWeek-1));
        } else if (dayOfWeek == 0) {
            addDays(retDate, -6);
        }
        return retDate;
    }
    
    function centerPopup($element){
			var top;
			var $window = $(window);
			var diff = $window.height() - $element.height();
			var top = diff < 0 ? $window.scrollTop() + 25 : $window.scrollTop() + diff/2;
			if(top > 100){
				top-=50;
			}					
			$element.css({
				top:top
			});
		}
    
    function getEndOfNextYear(date) {
        date.setYear(date.getFullYear() + 1);
        date.setMonth(11);
        date.setDate(31);
        return date;
    }
    
    function setDateValidators(thingThatChanged) {
        var $form = $(thingThatChanged).closest("form");
        var $rows = $form.find("tbody tr");
        if ($rows.length < 1) {
            return;
        }
        for (var i =0;i<$rows.length;i++) {
            var nextRow =  $();
            if (i + 1 < $rows.length) {
                nextRow = $($rows[i+1]);
            }
            setValidatorsOnRow($($rows[i]), nextRow);
        }
        lm.rebind($form);
        //$(thingThatChanged).trigger("change");
    }
    
    function dateFromInput($inp) {
        console.log("date from input got:" + $inp.val());
        if ($inp.length && $inp.val()){
            return new Date($inp.val());
        }
        return null;
    }
    
    function setNumberValidators($to,$from,$nextFrom){
        var to = $to.val();
        var fromVal = $from.val();
        var nextFrom = $nextFrom.val();
        if (fromVal){
            $to.attr("min",fromVal);
        }
        if (to){
            $from.attr("max", to);
        }
        if (nextFrom){
            $nextFrom.attr("min",to);
            $to.attr("max", nextFrom);
        }else{
            $to.attr("max", $("input[name='noDiscount']").attr("max"));
        }
    }
    
    function setValidatorsOnRow($thisRow,$nextRow) {
        var $to = $thisRow.find("input[name='to']");
        var $from = $thisRow.find("input[name='from']");
        var $nextFrom = $nextRow.find("input[name='from']");
        var toDate = dateFromInput($to);
        var fromDate = dateFromInput($from);
        var nextFromDate = dateFromInput($nextFrom);
        
        if($to.attr('type') != 'date'){
            setNumberValidators($to,$from,$nextFrom);
            return;
        }
        
        //from and to dates are each other's min and max.
        if (fromDate) {
            $to.attr("min", fromDate.toISOString().substr(0,10));
        }
        if (toDate) {
            $from.attr("max", toDate.toISOString().substr(0,10));
        }
        
        //if toDate is less than from, add a day to From and that's the new To value.
        if (toDate && toDate < fromDate) {
            $to.val(addDays(fromDate,6).toISOString().substr(0,10));
        }
        
        //if next rows From is less than this rows To, increase next row's from.
        if ((!nextFromDate && toDate) || (toDate && toDate > nextFromDate)) {
            $nextFrom.val(addDays(toDate,1).toISOString().substr(0,10));
        }
        
        
        //the from Date on the next row gets a min value of To's new value..
        if (nextFromDate) {
            $nextFrom.attr("min",toDate.toISOString().substr(0,10));
           $to.attr("max", nextFromDate.toISOString().substr(0,10));
        } else {
            $to.attr("max", endOfNextYear.toISOString().substr(0,10));
        }
        
    }
    
    function addDays(indat, days) {
        var dat = new Date(indat);
        dat.setDate(dat.getDate() + days);
        return dat;
    }
    
    var $priceForms = $(".provider-form");

    initTrayBehaviour();
    initSave();
    initDateRowsBehaviour();
    initDateInputBehaviour();
    initCopy();
    initNetGrossSwitch();
    initVolumeDiscount();
    initPopup();
    initVolDiscountTablebehaviour();
    
    function initPopup() {
        $(document).on('click',".close-me",function(){
            $(this).closest(".popup-window").hide();
        });
        
        function centerPopup($element){
            var top;
            var $window = $(window);
            var diff = $window.height() - $element.height();
            var top = diff < 0 ? $window.scrollTop() + 25 : $window.scrollTop() + diff/2;
            if(top > 100){
                top-=50;
            }					
            $element.css({
                top:top
            });
        }
    }
        
    function initVolumeDiscount() {
        //When the user clicks save we save the volume discount to the warehouse.
        //In addition the call to save everything now also includes a step to save the volume discount of the warehouse.
        $(document).on('click',".add-volume-discount",function() {
            showVolumeDiscountPopup();
        });
        
        function showVolumeDiscountPopup(){
          //don't need the template stuff anymore.
          //var popup = $("#volume-discount-popup");
          var volumeDiscount = templates.getTemplate("volume-discount");
          if (!volumeDiscount) return;
          var $popup = volumeDiscount.getElement();
          $('body').append($popup);
          centerPopup($popup);
        }    
    }
    
    //sets up the validation on date inputs as they change.. e.g. next row's from Date > this rows to Date.
    function initDateInputBehaviour() {
        
        //When a date input changes, or when we add or delete a row, we do the following:
        
        //each To input gets a min value of the From in the same row  
        //each To input gets a max value of the From of the next row. || if last row... end of next calendar year.
        //each From input gets a min value of the To in the previous row || if first row, last monday.
        //each From input gets a max value of the To in the same row.
         
        var changeWasCalledManuallySoDontSetValidators = false; //just a flag to protect against a recursive call to the below on change.
         
         $(document).on("change", "input[name='to'],input[name='from']", function(){
             if ($(this).closest("form").is(".volume-discount-form")) {
                 return;
             }
            if (!changeWasCalledManuallySoDontSetValidators) {
                setDateValidators(this);
                changeWasCalledManuallySoDontSetValidators = true;
                $(this).trigger("change");//retrigger validation of the input that changed now that we've changed the validators.
                changeWasCalledManuallySoDontSetValidators = false;
            }
         });
    }
    
    //sets up the functionality of the Copy From control.
    function initCopy() {
        $(document).on("click", ".copy-button",  copyButtonOnClick);
        
        function copyButtonOnClick(evt) {
            var $select = $(this).closest(".copy-controls").find("select");
            var storageToCopyId = $select.val();
            var thisStorageId = $(this).closest("form").data("storage_id");
            var fromTable = $("form[data-storage_id=" + storageToCopyId +"]");
            var toTable = $(this).closest(".date-range-pricing-tray");
            copyStorage(fromTable, toTable);
        }
        
        function copyStorage($fromTable,$toTable){ //clone all the tr's from the copy from table to the copy to.
            $fromTable;
            $toTable;
            $form = $toTable.closest("form");
            var $copyFromRows=$fromTable.find("tbody tr");
            var $newRows = $copyFromRows.clone(false);
            
            clearPricing($toTable);
            $toTable.find("tbody").append($newRows);
            $newRows.find("input").each(function(){
                $(this).removeAttr("id");
                $(this).removeClass("hasDatepicker");
                $(this).removeData('datepicker')
                $(this).unbind();
            });
            lm.rebind($form);
            Alerts.showSuccessMessage("Pricing data copied");
        }
        
        function clearPricing($elem) {
            $elem.find("tbody tr").remove();
        }
    }
    
    //sets up the functionality of the net / gross price switcher.
    function initNetGrossSwitch(){
        $(document).on("click", "#show-net button", netGrossOnClick);
        
        function netGrossOnClick(evt) {
            $(this).closest("#show-net").toggleClass("net"); //TODO change to class.
            var $form = $(this).closest("form");
            var commission = 0.11;
            var commissionMultiplier = 1 - commission;
            $($form).find("input.currency").each(function() {
                $(this).toggleClass("replaced-with-span");
                
                if(! $(this).is(".replaced-with-span")) {
                    $(this).show();
                    $(this).parent().find(".input-span").remove();
                    return;
                }

                var theValue = $(this).val();
                var num = parseFloat(theValue, 10);
                var valueToDisplay = "N/A"; //fallback for non-numeric / empty 
                if (!isNaN(num)) { 
                    //subtract the commission.
                    valueToDisplay = (num * commissionMultiplier).toFixed(2);
                }
                // 'Turn it into' a span.
                $(this).hide();
                $span = $(this).after("<span class='input-span'>" + valueToDisplay + "</span>");
                
            }); 
        }
    }
    
    //adding deleting rows from the date specific and availability tables. 
    function initDateRowsBehaviour(){ 
        
        function addRow($table, templateName) {
            var data = {};
            var template = templates.getTemplate(templateName);
            var to = $table.find('tbody tr').last().find('input[name="to"][type="date"]').val();
            if(to){
                date = new Date(to);
                date.setDate(date.getDate()+1);
            }else{
                date = new Date();
            }
            if (templateName !== 'pricing-row'){
                data.from = date.toISOString().substring(0, 10);
            }
            var $newrow = template.bind(data);
            var $totalPalletsInput = $newrow.find("input[name='total']"); 
            if ($totalPalletsInput.length > 0) {
                $totalPalletsInput.val($table.data("total-pallets"));
            }
            $table.append($newrow);
        }
        function addDiscountRow($table, templateName) {
            var data = {};
            var template = templates.getTemplate(templateName);
            var to = $table.find('tbody tr').last().find('input[name="to"]').val();
            if (!to) {
                to = parseInt($("input[name='noDiscount']").val(),10);
            } else {
                to = parseInt(to,10);
            }
            data.total = $("input[name='noDiscount']").attr("max");
            data.from = to+1;
            var $newrow = template.bind(data);
            var $totalPalletsInput = $newrow.find("input[name='total']"); 
            if ($totalPalletsInput.length > 0) {
                $totalPalletsInput.val($table.data("total-pallets"));
            }
            $table.append($newrow);
        }
        
        $(document).on("click",".add button",function(){
            var $form = $(this).closest("form");
            var $table = $(this).closest(".tray").find("table");
            //if(lm.isFormValid($form.attr('id'))){
                //var lastTo = $availTable.find('tbody').find('tr').last().find('input[name="to"]');
                //if(lastTo.val() != lastTo.attr('max')){
            var okToAddRow = lm.isFormValid($form.attr('id'));
            if (okToAddRow) {
                if ($form.is(".date-range-pricing-form")) {
                    addRow($table,"pricing-row");
                } else if ($form.is(".availability-form")){
                    addRow($table, "pallet-row");
                } else if ($form.is(".volume-discount-form")) {
                    addDiscountRow($table, "discount-row");
                }
                $table.find("tr.only-one").removeClass("only-one");
                lm.rebind($form);
            }
        });
        
        $(document).on('click','.trash-button',function(){
            var $form = $(this).closest('form');
            var $rows = $(this).closest('table').find('tbody tr');
            $(this).closest('tr').remove();
            setDateValidators(this);
            lm.rebind($form);
            if ($rows.length == 1) { //no rows left //uncomment this if you want to enforce at least one row.
                $form.find(".add button").trigger("click");					
            }
        });
    }
    
    function completeRegistration(){
			var completeTemplate = templates.getTemplate("complete-registration");
			if(!completeTemplate) return;
			var $popup = completeTemplate.getElement();
			$('body').append($popup);
			centerPopup($popup);
			var $form = $popup.find('form');
			lm.rebind($form);
			var form = lm.getForm($form.attr('id'));
			form.addOnSuccessCallback(function(data){
				if (typeof data.redirect == 'string' && typeof data.redirect !== 'undefined'){
					window.location = data.redirect;
				}else if (data.message !== undefined){
					Alerts.showErrorMessage(data.message);
				}
			});
		}
    
    //General Volume Discount table behaviour
    function initVolDiscountTablebehaviour(){
        
        var changeWasCalledManuallySoDontSetValidators = false;
        
        function changeDiscountfromValue($tableRow, templateName){
            var to = $tableRow.find('.discount-to').find('input[name="to"]').val();
            if (to){
                to = parseInt(to,10);
            }
            to++;
            $tableRow.next('.js-single-discount').find('.discount-from input[name="from"]').val(to);
            $tableRow.next('.js-single-discount').find('.discount-from span').text(to);
        }
        
        $(document).on('blur', '#volume-discount-table tbody tr td[data-th="To"] input[name="to"]', function (){
            var $tableRow = $(this).closest("tr");
            changeDiscountfromValue($tableRow, 'discount-row');
            
            if (!changeWasCalledManuallySoDontSetValidators) {
                setDateValidators(this);
                changeWasCalledManuallySoDontSetValidators = true;
                $(this).trigger("change");//retrigger validation of the input that changed now that we've changed the validators.
                changeWasCalledManuallySoDontSetValidators = false;
            }
        });
    }
    
    //the trays opening anc closing... actually quite complex logic involved in the end.
    function initTrayBehaviour() {
        $(document).on("click", ".open-tray-link", function(evt){
            openTray($(this));
        });
        
        function openTray($linkThatWasClicked) {
            $linkThatWasClicked.parent().find(".tray").toggleClass("open");
            $linkThatWasClicked.toggleClass("open");
            //if the tray has a table with no rows.. add one in so there's a blank row waiting for entry next time they open it.
            var rows = $linkThatWasClicked.parent().find(".tray table tr");
            if (rows.length <=1) { //1 because the header row will always be there.
                $linkThatWasClicked.parent().find(".add-button").trigger("click");
            }
            //TODO:
        }
        
        $(document).on('click','.popup',function(evt){ 
                var $this = $(this);
                editButtonClick($this);
        });
        
        function checkSectionCompleted(inputs){
            var completed = true; //Assume everything is ok
            for (var i = 0; i < inputs.length; i++){
                if(inputs[i][0].value !== "" && inputs[i][0].value !== undefined){
                    completed = true;
                }else{
                    completed = false;
                    break; //It is incomplete 
                }
            }
            return completed;
        }

        function editButtonClick($buttonThatWasClicked) {
            var pricingOrAvailability = $buttonThatWasClicked.data("type");
            var storageId = $buttonThatWasClicked.closest("tr").data("id"),
                $price = $buttonThatWasClicked.closest("tr").next().find('input[name="standard-pricing-price"]'),
                $handlingCharge = $buttonThatWasClicked.closest("tr").next().find('input[name="standard-pricing-handling-charge"]'),
                $inUse = $buttonThatWasClicked.closest("tr").next().find('input[name="inUse"]'),
                $to = $buttonThatWasClicked.closest("tr").next().find('.availability-table').find('input[name="to"]'),
                $from = $buttonThatWasClicked.closest("tr").next().find('.availability-table').find('input[name="from"]');
            
            //hide all the .trays tr's
            var $traysToOpen = $buttonThatWasClicked.closest("tr").next();
            var $trayHolderToOpen = $traysToOpen.find('.tray-holder.' + pricingOrAvailability + '-trays');
            
            //show/hide the next tr
            var wasOpen = ($traysToOpen.hasClass("open") && $trayHolderToOpen.hasClass('open'));
            $(".trays").removeClass('open');
            $(".button-cell").removeClass('open');
            if (!wasOpen) {
                $traysToOpen.addClass("open");
                $buttonThatWasClicked.closest(".button-cell").addClass("open");
                if ($buttonThatWasClicked.data('type') === 'pricing'){
                    if (checkSectionCompleted([$inUse,$to,$from])){
                        $buttonThatWasClicked.closest(".button-cell").next('.button-cell').addClass("success");
                    }else{
                        $buttonThatWasClicked.closest(".button-cell").next('.button-cell').removeClass("success");
                    } 
                }else if($buttonThatWasClicked.data('type') === 'availability'){
                    if (checkSectionCompleted([$price,$handlingCharge])){
                        $buttonThatWasClicked.closest(".button-cell").prev('.button-cell').addClass("success");
                    }else{
                        $buttonThatWasClicked.closest(".button-cell").prev('.button-cell').removeClass("success");
                    }  
                }
            }else{
                if ($buttonThatWasClicked.data('type') === 'pricing'){
                    if (checkSectionCompleted([$price,$handlingCharge])){
                        $buttonThatWasClicked.closest(".button-cell").addClass("success");
                    }else{
                        $buttonThatWasClicked.closest(".button-cell").removeClass("success");
                    }  
                }else if($buttonThatWasClicked.data('type') === 'availability'){
                   if(checkSectionCompleted([$inUse,$to,$from])){
                        $buttonThatWasClicked.closest(".button-cell").addClass("success");
                    }else{
                        $buttonThatWasClicked.closest(".button-cell").removeClass("success");
                    }    
                }
            }
            
            //within the tr show either the price div or availability div depending on which one we clicked.
            $traysToOpen.find('.tray-holder').removeClass('open');
            $trayHolderToOpen.addClass("open");
            //within the div, close all the trays and then open the first tray.
            $trayHolderToOpen.find(".tray").removeClass("open");
            $trayHolderToOpen.find(".open-tray-link").removeClass("open");
            $trayHolderToOpen.find("div").first().find(".tray").addClass('open');
            $trayHolderToOpen.find("div").first().find(".open-tray-link").addClass("open");
            
            if ($trayHolderToOpen.find("form:nth-child(2)").find('div').first()){ //If it has two inner trays
                $trayHolderToOpen.find("form:nth-child(2)").find('div').first().find('.tray').addClass('open');
                $trayHolderToOpen.find("form:nth-child(2)").find('div').first().find(".open-tray-link").addClass('open');
            }
            
        }
        
    }
    
    //posting up the storages to the server.
    function initSave() {
        
        function clearSkipMarkerRows() {
            $(".skipThisRow").removeClass("skipThisRow");
        }
        
        $priceForms.on("submit", function(ev) {
            clearSkipMarkerRows();
            ev.preventDefault();
            var thisStorageId = $(this).data("storage-id");
            if(lm.isFormValid($(this).attr('id')) ){ //check this form at least is valid before we try and save.
                saveSingleStorage(thisStorageId);
            }
        });
        
        $(document).on('click',"#save-and-finish",function(ev) {
            clearSkipMarkerRows();
            if ($(location).attr("pathname").indexOf('dashboard') != -1){
                saveEverything(openSavedPopup);
            }else{
                if(checkBasicPricingAndAvailabilityPopulated() === false){
                    callPAndAWarningPopup();
                }else{
                    saveAndRegisterOrRedirect($(this).data('redirect'));
                }
            }
        });
        
        function openSavedPopup(){
            var saveTemplate = templates.getTemplate("save-registration");
            var $popup = saveTemplate.bind({});
            $('body').append($popup);
            centerPopup($popup);
        }
        
        $(document).on('click','button[name="acepted-p-and-a-terms"]',function(ev) {
             $(this).closest('.popup-window').hide();
             saveAndRegisterOrRedirect($('#save-and-finish').data('redirect'));
        });
        
        function checkBasicPricingAndAvailabilityPopulated(){
            var inputs = [$('input[name="standard-pricing-price"]'),$('input[name="standard-pricing-handling-charge"]'),$('.availability-table tr input[name="from"]'),$('.availability-table tr input[name="inUse"]'),$('.availability-table tr input[name="to"]')];
            var allPopulated = true;
            for (var i = 0; i<inputs.length; i++){
                $(inputs[i]).each(function(){
                    if ($(this).val() === ""){
                        allPopulated = false;
                    }
                });
            }
            return allPopulated;
        }
        
        function saveAndRegisterOrRedirect(redirectLink){
            if ($('input[name="user-active"]').val() === "true"){
                saveEverything(redirectToURL(redirectLink));
            }else if($('input[name="user-active"]').val() === "false"){
                saveEverything(completeRegistration);
            }
            //then check for error and redirect to next page.
        }
        
        function callPAndAWarningPopup(){
            var completeTemplate = templates.getTemplate("p-and-a-warning");
            var $popup = completeTemplate.getElement();
            $('body').append($popup);
            centerPopup($popup);
        }
        
        function redirectToURL(url){
            window.location.href = url;
        }
        
        function saveSingleStorage(id) {
            var target = $("#pricing-container-" + id);
            var storageJSON = getStorageJSON($(target)); //".js-all-storages"
            //get storage with the id we passed in.
            var thisStorage;
            for (var i=0;i<storageJSON.length;i++){
                if (storageJSON[i]._id == id) {
                    thisStorage = storageJSON[i];
                } 
            } 
            if (thisStorage) {
                saveStorage(thisStorage, function(){
                    Alerts.showSuccessMessage("Data saved");
                    lm.clearValidationStylesOnAllForms();
                });
            }
            
            
        }
        
        //check if all the row's inputs are blank (ignoring the 'from' field which is autofilled when we add a new row)
        //if so then we can safely ignore it rather than requiring it be valid.
        function shouldIgnoreThisRow($tr){
            $inputs = $($tr).find("input").not("input[name='from']").not(":disabled");
             for (var i=0;i<$inputs.length;i++) {
                 if ($($inputs[i]).val() !== "") {
                     
                     return false;
                 }
             }
             console.log("found a row to ignore");
             return true;
        }
        
        function shouldIgnoreTheseInputs(inputs){
             var ignore = true;
             for (var i=0;i<inputs.length;i++) {
                 if ($(inputs[i]).val() === "") {
                     console.log("found a inputs to ignore");
                     return true;
                 }
             }
             
             return false;
        }
        
        function markThisRowToBeSkipped($row) {
            $($row).find(".input-field").addClass("loom-ignore");
            $($row).addClass("skipThisRow");
        }
        
        function markTheseInputsToBeSkipped(inputs) {
            for (var i = 0; i<inputs.length; i++){
                $(inputs[i]).parent(".input-field").addClass("loom-ignore");
            }
        }
        
        function unmarkAllTheseRows($rows) {
            $($rows).find(".loom-ignore").removeClass("loom-ignore");
            $($rows).find(".skipThisRow").removeClass("skipThisRow");
        }
        
        function getRowsWithoutSkipped($rows) {
            return $($rows).not(".skipThisRow");
        }
        
        function saveEverything(cb) {
            var storageJSON = getStorageJSON($(".js-all-storages"));
            //check that the storage JSON looks ok...
            saveAllStorages(storageJSON, function(response){
                if (response !== undefined){
                    if (response.error !== undefined && response.error === true && response.data !== undefined && response.data === "Users do not Match"){
                        window.location.href = '/'; //The users don't match, they have been logged out, now send them to the home page.
                    }else{
                        alertWhSavedAndCallback(cb)//The callback is always asking them to register, need to determine whether they need to
                        //if it all went ok, redirect them to the next page.
                    }
                }else{
                    alertWhSavedAndCallback(cb);//The callback is always asking them to register, need to determine whether they need to
                }
            });

        }
        
        function alertWhSavedAndCallback(cb){
            Alerts.showSuccessMessage("Data saved");
            $("body").removeClass("wait");
            if (cb) {
                cb();
            }
        }
        
        function getStorageJSON($formContainer) {
            var $storages = $formContainer.find(".js-storage");
            var storages = []
            for (var i = 0; i<$storages.length;i++) {
                var thisStorageJSON = getStorageJSONFromFieldset($storages[i]);
                if (thisStorageJSON) { // this test ignores any where basic pricing isn't set.
                    storages.push(thisStorageJSON);
                }
            }
            return storages;
            
            function getStorageJSONFromFieldset(fieldSetForThisStorage) {
                var $this = $(fieldSetForThisStorage);
                var $this = $(fieldSetForThisStorage);
                var storageId= $this.data("storageId");
                var storage = {"_id" : storageId};
                storage.pallets = getAvailabilityJSONFromFieldSet($this) || [];
                storage.basicPricing = getBasicPricingJSONFromFieldset($this) || null;
                storage.pricing = getDateSpecificPricingJSONFromFieldSet($this) || [];
                /*if (storage.basicPricing == null) { //no point saving if there's no basic pricing set... turns out there is a point.
                    return false;
                }*/
                return storage;
            }
            
            function getBasicPricingJSONFromFieldset($fieldset){
                var priceInput = $fieldset.find("input[name='standard-pricing-price']");
                var formId = priceInput.closest("form").attr("id");
                var inputs = [$fieldset.find('input[name="standard-pricing-price"]'),$fieldset.find('input[name="standard-pricing-handling-charge"]')];
                if (shouldIgnoreTheseInputs(inputs)){
                     markTheseInputsToBeSkipped(inputs);
                }
                lm.rebind($('#'+formId));
                if (lm.isFormValid(formId)) {
                    var price  = $fieldset.find("input[name='standard-pricing-price']").val();
                    var charge = $fieldset.find("input[name='standard-pricing-handling-charge']").val(); 
                    var basicPricing = {"price" : price, "charge" : charge };
                    return basicPricing;
                } else {
                    Alerts.showPersistentErrorMessage("Unable to save this storage.. You must enter standard pricing for the storage first.");
                    throw "Basic Pricing invalid";
                    
                }
                return false; 
            }
            
            //wrap this and the availability stuff into one function.
            function getDateSpecificPricingJSONFromFieldSet($fieldset) {
                var pricing = [];
                var $dateSpecificPricing = $fieldset.find(".js-date-specific-inputs-container");
                var formId = $dateSpecificPricing.closest("form").attr("id");
                var $rows = $dateSpecificPricing.find(".js-single-date-range-inputs-container");
                for (var i =0;i<$rows.length;i++){
                    if (shouldIgnoreThisRow($rows[i])) {
                        markThisRowToBeSkipped($rows[i]);
                    } 
                }
                lm.rebind($('#'+formId));
                if (lm.isFormValid(formId)) {
                    var $rowsToProcess = getRowsWithoutSkipped($rows);
                    unmarkAllTheseRows($rows);
                    for (var i =0;i<$rowsToProcess.length;i++) {
                        var thisPricing = getSingleDateSpecificPricingJSONFromRow($rowsToProcess[i]);
                        pricing.push(thisPricing);
                    }
                    lm.rebind($('#'+formId));
                    return pricing;
                } else {
                    Alerts.showPersistentErrorMessage("Unable to save this storage.. you have some invalid Date Specific Pricing entries");
                    throw "Date range pricing invalid";
                }
                unmarkAllTheseRows($rows);
                lm.rebind($('#'+formId));
                return false;
            }
            
            function getSingleDateSpecificPricingJSONFromRow(row){
                var $row = $(row);
                var pricing = {"from" : '', "to" : '', "price" : '', "charge" : ''};
                for (var f in pricing) {
                    var value = $row.find("input[name='" + f + "']").val();
                    if (!value) {
                        continue;
                    }
                    if (f == "from" || f == "to") {
                        pricing[f] = new Date(value).toISOString().substring(0, 10);
                    } else {
                        pricing[f] = value;
                    }
                }
                return pricing;
            }
            
            function getAvailabilityJSONFromFieldSet($fieldset) {
                var availability = [];
                var $avail = $fieldset.find(".js-availability-inputs-container");
                var formId = $avail.closest("form").attr("id");
                var $rows = $avail.find(".js-single-availability-inputs-container");
                var inputs = [];
                for (var i = 0; i<$rows.length; i++){
                    inputs.push($($rows[i]).find('input[name="from"]'));
                    inputs.push($($rows[i]).find('input[name="to"]'));
                    inputs.push($($rows[i]).find('input[name="inUse"]'));
                }
                if (shouldIgnoreTheseInputs(inputs)) {
                    markTheseInputsToBeSkipped(inputs);
                } 
                lm.rebind($('#'+formId));
                if (lm.isFormValid(formId)) {
                    var $rowsToProcess = getRowsWithoutSkipped($rows);
                    unmarkAllTheseRows($rows);
                    for (var i =0;i<$rowsToProcess.length;i++) {
                        var thisAvailability = getSingleAvailabilityJSONFromRow($rowsToProcess[i]);
                        availability.push(thisAvailability);
                    }
                    lm.rebind($('#'+formId));
                    return availability;
                } else {
                    Alerts.showPersistentErrorMessage("Unable to save this storage.. you have some invalid Availability entries");
                    throw "Availability invalid";
                }
                unmarkAllTheseRows($rows);
                lm.rebind($('#'+formId));
                return false;
            }
            
            function getSingleAvailabilityJSONFromRow(row) {
                var $row = $(row);
                var avail = {"from" : '', "to" : '', "total" : '', "inUse" : '', "free" : ''};
                for (var f in avail) {
                    var value = $row.find("input[name='" + f + "']").val();
                    if (!value) {
                        continue;
                    }
                    if (f == "from" || f == "to") {
                        avail[f] = new Date(value).toISOString().substring(0, 10);
                    } else {
                        avail[f] = value;
                    }
                }
                return avail;
            }
        }
        
        function saveAllStorages(storages, cb) {
            warehouse.id=$('input[name="warehouse"]').val();
            Warehouse.updateStorageBatch(warehouse,storages,function(response){
                if(cb) cb(response);
            });
        }

        function saveStorage(storage, cb){
            warehouse.id=$('input[name="warehouse"]').val();
            Warehouse.updateStorage(warehouse,storage,function(){
                if(cb) cb();
            });
        }
        
        //Volume Discount stuff
        
        $(document).on("change", "input[name='noDiscount']", function(evt) {
            var thisVal = $(this).val();
            var $row = $("#volume-discount-table").find("tbody tr").first();
            $row.find(".js-from").html(thisVal);
            $row.find("input[name='to']").attr("min",thisVal);
            $row.find("input[name='from']").val(thisVal);
            lm.rebind($(this).closest("form"));
        });
        
        $(document).on("submit","#discount-form", function(evt){
            evt.preventDefault();
            saveVolumeDiscount(false,$('#volume-discount-popup'));
        });
        
        function saveVolumeDiscount(calledFromSaveEverything,$popup) {
            var $form = $("#discount-form");
            var $rows = $form.find(".js-single-discount");
            unmarkAllTheseRows($rows);
            for (var i =0;i<$rows.length;i++) {
                if (shouldIgnoreThisRow($rows[i])) {
                    markThisRowToBeSkipped($rows[i]);
                }
            }
            lm.rebind($form);
            var discountData = {};
            if (lm.isFormValid($form.attr("id"))) {
                var noDiscount = $form.find("input[name='noDiscount']").val();
                var $rowsToProcess = getRowsWithoutSkipped($rows);
                unmarkAllTheseRows($rows);
                var discounts = [];
                for (var i =0;i<$rowsToProcess.length;i++) {
                    discounts[i] = getVolumeDiscountJSONfromRow($rowsToProcess[i]);
                }
                discountData.discounts = discounts;
                discountData.noDiscount = noDiscount;
                var warehouse = {}
                warehouse.id=$('input[name="warehouse"]').val();
                Warehouse.updateVolumeDiscount(warehouse,discountData, function(){
                    Alerts.showSuccessMessage("data saved");
                    $popup.hide();
                });
            } else {
                unmarkAllTheseRows($rows);
                if (calledFromSaveEverything) {
                    Alerts.showPersistentErrorMessage("You have some invalid volume discount entries, please check these then try and save again");
                    throw "error invalid volume discounts";
                }
            } 
        }
        
        function getVolumeDiscountJSONfromRow($row) {
            var thisRowData = {};
            var inputs = ['from', 'to', 'perc'];
            for (var i =0;i<inputs.length;i++) {
                var input = $($row).find("input[name='" + inputs[i] + "']");
                var val = input.val();
                thisRowData[inputs[i]] = val;
            }
            return thisRowData;
        }
        
        
        
    }
    
    //availability stuff.
    $(document).on("change keyup",'input[name="inUse"]',function(){
                var $tr = $(this).closest('tr');
                var inUse = Number($(this).val());
                var total = Number($tr.find("input[name='total']").val());
                var free = total - inUse;
                $tr.find('input[name="free"]').val(free);
    });
    
    function calcProgress(){
            var $progress = $('.progress-row');
            $progress.empty();
            $availTable.find('tbody tr').each(function(){
                var $row = $(this);
                var $from = $row.find('input[name="from"]');
                var $to = $row.find('input[name="to"]');
                var today = new Date();
                var from = new Date($from.val());
                var date = $to.val();
                if(!date){
                    return true;
                }
                var to = new Date(date);
                var dayDiff = (from - today)/(1000*60*60*24);
                var left = today.getDate() * 100 / (365+30);
                left+= dayDiff * 100 / (365+30);
                dayDiff = (to - from)/(1000*60*60*24);
                var width = dayDiff * 100 / (365+30);
                var $td = $('<td/>');
                $td.css({
                    width:width + '%',
                    left:left + '%'
                });
                $progress.append($td);
            });			
        }
    
});
    /*
    
    function isStorageComplete(Storage,$tr){
        var complete=true;
        if(!Storage || Number(Storage.basicPricing.price) <= 0 ){
            $tr.find('.pricing').addClass('error');
            complete=false;
        }else{
            $tr.find('.pricing').removeClass('error');
        }
        if(!Storage || !Storage.pallets.length){
            $tr.find('.pallets').addClass('error');
            complete=false;
        }else{
            $tr.find('.pallets').removeClass('error');
        }
        return complete;
    }
    $(document).on("popup-form-success",function(ev,id){
        updateStorage(id);
        var formId = $(ev.target.activeElement).closest('form').attr('id');
        $priceForm.find('tbody tr').each(function(){
            var $tr = $(this);
            if( $tr.data('id') === id ){
                switch(formId){
                    case 'pricing-form':
                        $tr.find('.pricing').addClass('success');
                        break;
                    case 'discount-form':
                        $tr.find('.discounts').addClass('success');
                        break;
                    case 'pallets-form':
                        $tr.find('.pallets').addClass('success');
                        break;
                    default:
                        return false;
                }
                return false;
            }
        });
    });
    popups();
    function updateStorage(id){
        if(storage[id]){
            warehouse.id=$priceForm.find('input[name="warehouse"]').val();
            Warehouse.updateStorage(warehouse,storage[id]);
        }
    }
    function saveStorage(cb){
        warehouse.id=$priceForm.find('input[name="warehouse"]').val();
        var s=[];
        for(i in storage){
            s.push(storage[i]);
        }
        Warehouse.updateStorageBatch(warehouse,s,function(){
            if(cb) cb();
        });
    }
    function popups(){
        $('.popup').on("click",function(evt){
            editButtonClick($(this));
        });
        $(document).on("click",".add-volume",function(){
            showPopup($(this).val(),'volume');
        });
    }
    function showPopup(storageId,templateName){
        var template = templates.getTemplate(templateName);
        getStorage(storageId,function(Storage){
            var $element = template.bind(Storage);
            $element.find("form").data("storage_id",storageId); //just so we have access to the storage ID if we need it.
            $('body').append($element);
            switch( templateName ){
                case 'pricing':
                    doPricing(Storage,$element);
                    break;
                case 'pallets':
                    doPallets(Storage,$element);
                    break;
                case 'volume':
                    doDiscount(Storage,$element);
                    break;
                
            }
            lm.rebind($element.find('form'));
            centerPopup($element);
        });
    }
    function getStorage(id,cb){
        if( storage[id] ){
            cb(storage[id])
        }else{
            Warehouse.getStorage(id,function(Storage){
                storage[id] = Storage.data;
                cb(storage[id]);
            });
        }
    }
    function doPricing(_Storage,_$element){
        var $element = _$element;
        var $form = $element.find('form');
        var $basicPricingTable = $('#default-pricing-table');
        var $datePricingTable = $('#date-pricing-table');
        var template = templates.getTemplate("pricing-row");
        var Storage = _Storage;
        
        function datePricing(){
            if(!Storage.pricing || !Storage.pricing.length){
                var data={};
                var from = new Date(),
                    to = new Date();
                to.setDate(from.getDate() + 364);
                data.from = from.toISOString().substring(0, 10);
                addPricingRow(data);
            }else{
                for(i in Storage.pricing){
                    Storage.pricing[i].from = new Date(Storage.pricing[i].from).toISOString().substring(0, 10);
                    Storage.pricing[i].to = new Date(Storage.pricing[i].to).toISOString().substring(0, 10);
                    Storage.pricing[i].price = toPrice(Storage.pricing[i].price);
                    Storage.pricing[i].charge = toPrice(Storage.pricing[i].charge);
                    Storage.pricing[i].reserve = toPrice(Storage.pricing[i].reserve);
                    var $row = template.bind( Storage.pricing[i] );
                    $datePricingTable.append($row);
                }
            }
        }
        function events(){
            $element.find('.add').on("click",function(){
                if( lm.isFormValid($(this).closest('form').attr('id')) ){
                    addPricingRow();
                    rebind();
                }
            });
            $form.on("submit",function(ev){
                ev.preventDefault();
                if( lm.isFormValid($(this).closest('form').attr('id')) ){
                    Storage.basicPricing=getBasicPricing();
                    Storage.pricing=toArray();
                    $(document).trigger("popup-form-success",Storage._id);
                    closePopup();
                }
            });
            $element.on('click','.trash-button',function(){
                $(this).closest('tr').remove();
                rebind();
            });
            $form.on("change",'input[name="from"],input[name="to"]',function(){
                var $row = $(this).closest('tr');
                var $from = $row.find('input[name="from"]');
                var $to = $row.find('input[name="to"]');
                if($from.val()){
                    $to.attr('min',$from.val());
                }
                if($to.val()){
                    $from.attr('max',$to.val());
                }
                rebind();
            });
        }
        function basicPricing(){
            var basicPricing = Storage.basicPricing ? Storage.basicPricing : {};
            var basicPricingTemplate = templates.getTemplate("basic-pricing-row");
            basicPricing.price = toPrice(basicPricing.price);
            basicPricing.charge = toPrice(basicPricing.charge);
            basicPricing.reserve = toPrice(basicPricing.reserve);
            var $basicPricing = basicPricingTemplate.bind(basicPricing);
            $basicPricingTable.find('tbody').append($basicPricing);
        }
        function addPricingRow(_data){
            var data = _data || {};
            if(!_data){
                var to = $datePricingTable.find('tbody tr').last().find('input[name="to"]').val();
                if(to){
                    date = new Date(to);
                    date.setDate(date.getDate()+1);
                }else{
                    date = new Date();
                }
                data.from = date.toISOString().substring(0, 10);
            }
            var $newrow = template.bind(data);
            $datePricingTable.append($newrow);
        }
        function getBasicPricing(){
            var $pricing = $basicPricingTable.find('tbody tr').first();
            var pricing = {};
            bindFormToObject($pricing,pricing);
            return pricing;
        }
        function toArray(){
            var array=[];
            $datePricingTable.find('tbody tr').each(function(){
                var price={};
                bindFormToObject($(this),price);
                price.from = new Date(price.from).toISOString();
                price.to = new Date(price.to).toISOString();
                if(price.price || price.charge || price.reserve){
                    array.push(price);
                }
            });
            return array;
        }
        function rebind(){
            //sortDateMaxMin($datePricingTable);
            lm.rebind($form);
        }
        function init(){
            events();
            basicPricing();
            datePricing();
        }
        init();
    }*/
    /*function doPallets(_Storage,$element){
        var template = templates.getTemplate("pallet-row");
        var Storage = _Storage;
        var $form = $element.find('form');
        var $availTable = $element.find('.availability-table');
        if(!Storage.pallets || !Storage.pallets.length){
            addPalletRow();
        }else{
            for(i in Storage.pallets){
                Storage.pallets[i].from = new Date(Storage.pallets[i].from).toISOString().substring(0, 10);
                Storage.pallets[i].to = new Date(Storage.pallets[i].to).toISOString().substring(0, 10);
                addPalletRow( Storage.pallets[i] );
            }
        }
        function events(){
            $element.find('.add').on("click",function(){
                if( lm.isFormValid($form.attr('id')) ){
                    //var lastTo = $availTable.find('tbody').find('tr').last().find('input[name="to"]');
                    //if(lastTo.val() != lastTo.attr('max')){
                        addPalletRow();
                        rebind();
                    //}
                }
            });
            $form.on("submit",function(ev){
                ev.preventDefault();
                if( lm.isFormValid($form.attr('id')) ){
                    Storage.pallets=toArray();
                    $(document).trigger("popup-form-success",Storage._id);
                    closePopup();
                }
            });
            $element.on('click','.trash-button',function(){
                $(this).closest('tr').remove();
                rebind();
            });
            $form.on("change",'input',calcProgress);
            $form.on("change keyup",'input[name="inUse"]',function(){
                var $tr = $(this).closest('tr');
                var obj={};
                bindFormToObject($tr,obj);
                obj.free=Number(obj.total)>=Number(obj.inUse) ? obj.total-obj.inUse : 0;
                
                $tr.find('input[name="free"]').val(obj.free);
            });
            $form.on("change",'input[name="from"],input[name="to"]',function(){
                var $row = $(this).closest('tr');
                var $from = $row.find('input[name="from"]');
                var $to = $row.find('input[name="to"]');
                if($from.val()){
                    $to.attr('min',$from.val());
                }
                if($to.val()){
                    $from.attr('max',$to.val());
                }
                rebind();
            });
        }

        function setNextRow(index,value){
            return;
            var $row = $availTable.find('tbody tr').eq(index);
            if(!$row.length) return;
            var $from = $row.find('input[name="from"]');
            var $to = $row.find('input[name="to"]');
            var diff = (new Date($to.val()) - new Date($from.val())) /(1000*60*60*24);
            var from = new Date(value);
            from.setDate(from.getDate() + 1);
            $from.val(from.toISOString().substring(0, 10));
            if(!isNaN(diff)){
                var to = new Date($from.val());
                to.setDate(to.getDate() + diff);
                $to.val(to.toISOString().substring(0, 10))
            }
            $to.attr('min',from.toISOString().substring(0, 10));
            setNextRow(index+1,$to.val());
        }
        function addPalletRow(_data){
            var data = _data || {};
            if(!_data){
                data.total = Storage.palletSpaces;
                data.inUse = 0;
                data.free = data.total;
                var arr = toArray();
                if(arr.length){
                    var date = new Date(arr[arr.length-1].to);
                    date.setDate(date.getDate()+1);
                    data.from = date.toISOString().substring(0, 10);
                    var dateTo = new Date(data.from);
                    if ((dateTo.getFullYear()+1) % 4 == 0){
                        dateTo.setDate(dateTo.getDate()+366);
                    }else{
                        dateTo.setDate(dateTo.getDate()+365);
                    }
                    //data.to = dateTo.toISOString().substring(0, 10);
                }
            }
            var $row = template.bind( data );
            $availTable.find('tbody').append($row);
        }
        function calcProgress(){
            var $progress = $('.progress-row');
            $progress.empty();
            $availTable.find('tbody tr').each(function(){
                var $row = $(this);
                var $from = $row.find('input[name="from"]');
                var $to = $row.find('input[name="to"]');
                var today = new Date();
                var from = new Date($from.val());
                var date = $to.val();
                if(!date){
                    return true;
                }
                var to = new Date(date);
                var dayDiff = (from - today)/(1000*60*60*24);
                var left = today.getDate() * 100 / (365+30);
                left+= dayDiff * 100 / (365+30);
                dayDiff = (to - from)/(1000*60*60*24);
                var width = dayDiff * 100 / (365+30);
                var $td = $('<td/>');
                $td.css({
                    width:width + '%',
                    left:left + '%'
                });
                $progress.append($td);
            });			
        }
        function toArray(){
            var array=[];
            $availTable.find('tbody tr').each(function(){
                var pallet={};
                bindFormToObject($(this),pallet);
                pallet.from = new Date(pallet.from).toISOString();
                pallet.to = new Date(pallet.to).toISOString();
                array.push(pallet);
            });
            return array;
        }
        function rebind(){
            lm.rebind($form);
            calcProgress();
            trashButton();
        }
        function trashButton(){
            if($availTable.find('tbody tr').length==1){
                $availTable.find('.trash-button').addClass('hidden');
            }else{
                $availTable.find('.trash-button').removeClass('hidden');
            }
        }
        function init(){
            trashButton();
            calcProgress();
            events();
            lm.rebind($form);
        }
        init();
    }*/
    
    
    /*function doDiscount(_Storage,$element){
        var template = templates.getTemplate("discount-row");
        var Storage = _Storage;
        var $form = $element.find('form');
        var $table =  $form.find('table');
        if((!Storage.discounts || !Storage.discounts.length) && Storage.noDiscount != Storage.palletSpaces){
            addDiscountRow();
        }else{
            for(i in Storage.discounts){
                addDiscountRow( Storage.discounts[i] );
            }
        }
        $element.find('.add').on("click",function(){
            if( lm.isFormValid($form.attr('id')) ){
                var max = $table.find('tbody tr').last().find('input[name="to"]').val();
                if(Number(Storage.noDiscount) === Number(Storage.palletSpaces) || 
                    Number(max) === Number(Storage.palletSpaces) ){
                    
                }else{
                    addDiscountRow();
                    lm.rebind($form);
                }
            }
        });
        $form.on("submit",function(ev){
            ev.preventDefault();
            if( lm.isFormValid($form.attr('id')) ){
                Storage.discounts=toArray();
                $(document).trigger("popup-form-success",Storage._id);
                $form.closest('.popup-window').remove();
            }
        });
        $element.on('click','.trash-button',function(){
            $(this).closest('tr').remove();
            lm.rebind($form);
        });
        $form.find('input[name="noDiscount"]').on("change keyup",function(){
            var $input = $(this);
            Storage.noDiscount=$(this).val();
            if(Number($input.val()) === Number(Storage.palletSpaces)){
                $table.find('tbody').empty();
            }else{
                setNextRow(0,Number($(this).val())+1);
            }
            lm.rebind($form);
        });
        $form.on("change",'input[name="to"]',function(){
            var index = $(this).closest('tr').index();
            setNextRow(index+1,Number($(this).val())+1);
            lm.rebind($form);
        });
        function setNextRow(index,value){
            var $row = $form.find('tbody tr').eq(index);
            if(!$row.length) return;
            var $from = $row.find('.discount-from');
            $from.find('span').text( value );
            $from.find('input').val( value ).attr('min',value).attr('max',value);
            $row.find('.discount-to input').attr('min',value);
        }
        function addDiscountRow(_data){
            var data = _data || {};
            if(!_data){
                data.from = Storage.noDiscount ? Number(Storage.noDiscount ) + 1 : 1;
                data.to = Storage.palletSpaces;
                data.perc = 0;
                var arr = toArray();
                if(arr.length){
                    data.from=Number(arr[arr.length-1].to )+1;
                    data.to=Storage.palletSpaces;
                }
            }
            data.perc = Number(data.perc).toFixed(1);
            data.total = Storage.palletSpaces;
            var $row = template.bind( data );
            $element.find('tbody').append($row);
        }
        function toArray(){
            var array=[];
            $element.find('tbody tr').each(function(){
                var discount={};
                bindFormToObject($(this),discount);
                array.push(discount);
            });
            return array;
        }
    }*/				