define(["jquery", "./formField", "./loomConfig"],function($, FormField, Config){

	// MODEL OBJECT
	return function Class($form) {
		
        // Form level config options.
        config = Config;
        
	var FORM_PENDING_CLASS  =  config.FORM_PENDING_CLASS || "form-pending";
	var FORM_ERROR_CLASS    =  config.FORM_ERROR_CLASS || "form-error";
	var FORM_SUCCESS_CLASS  =  config.FORM_SUCCESS_CLASS || "form-success";
        var FORM_SOFT_ERROR_CLASS = config.FORM_SUCCESS_CLASS || "form-soft-error";
        var FORM_HARD_ERROR_CLASS = config.FORM_SUCCESS_CLASS || "form-hard-error";
        var FORM_FIELD_CONTAINER_SELECTOR = config.FORM_FIELD_CONTAINER_SELECTOR || ".input-field";
		
	var VALIDATE_ON_BLUR                    = config.VALIDATE_ON_BLUR;
	var MAY_NOT_PROGRESS_PAST_INVALID_FIELD = config.MAY_NOT_PROGRESS_PAST_INVALID_FIELD;
	var REALTIME_VALIDATION                 = config.REALTIME_VALIDATION;
	var JUMP_TO_INVALID_FIELD_ON_SUBMIT     = config.JUMP_TO_INVALID_FIELD_ON_SUBMIT;


	var formElement = $();
	var fields = [];
	var url;
	var action;
	var dataType;
	var prefix;
        var successCallbacks = [];
        
        var errorCallbacks = []; //called for any type of error
        var softErrorCallbacks = []; //called for soft error (server response tells us there's an error
        var hardErrorCallbacks = []; // called for hard errors (404,401 error parsing response, timeout etc.).
        
        var disableOnSuccess;
        var noAJAX;
        var noSubmit;
        var resetOnSuccess;
        var isIE;
	var responseHandler;
        
	// INIT
	formElement 	= $($form);
        url 		= formElement.attr("action");
        action 		= formElement.attr("data-loom-action");
        dataType 	= formElement.attr("data-loom-data-type");
        prefix 		= formElement.attr("data-loom-field-prefix") || "";
        noAJAX          = formElement.attr("data-loom-no-ajax");
        noSubmit        = formElement.attr("data-loom-no-submit");
        disableOnLoad   = formElement.attr("data-loom-disabled"); //disable the form immediately, changing the submit button to an edit button
        disableOnSuccess= formElement.attr("data-loom-disable-on-success"); //TODO : being implemented
        resetOnSuccess  = formElement.attr("data-loom-reset-on-success"); //TODO : being implemented
        isIE = (navigator.appName == 'Microsoft Internet Explorer' || (!(window.ActiveXObject) && "ActiveXObject" in window));
        isSafari = (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1);
        if (!dataType) {
            dataType="json";
        }
        
        
        formElement.attr("novalidate", "novalidate");
        
	setupNormalInputs();
	setupRadioInputs();
	setupFieldDependentValidators();
	setupConfirmationValidators();
        setupFieldCompareValidators();
        setupAutoPopulationOnSelection();
        setupCopyOnCheck();
        disableIfDisableOnLoadSet();
        
        //TODO if we try to submit an invalid form, an invalid message appears.
        // if we then fill out the fields correctly, when we come back to the bottom of the form the messages is still there.
		
		if (REALTIME_VALIDATION) {
			var lim = fields.length;
			for(var i = 0;i<lim;i++){
                 // keyup for text, change for radio, check, select.
                var validationFunc = getValidationCallback(fields[i]);
                var validationFuncIgnoringTabKeypress = wrapCallbackInTabIgnore(validationFunc); //We dont want validation firing when we've just tabbed to a new field.
				fields[i].element.on("keyup", validationFuncIgnoringTabKeypress);
                fields[i].element.on("change", validationFuncIgnoringTabKeypress); //we add both so it handles clicks and keypresses.
			}
		}
		
		if(VALIDATE_ON_BLUR || MAY_NOT_PROGRESS_PAST_INVALID_FIELD || REALTIME_VALIDATION){
			var lim = fields.length;
			for(var i = 0;i<lim;i++){
				fields[i].element.on("blur", getValidationCallback(fields[i]));
			}
		}
        
        function disableIfDisableOnLoadSet(){
            if (disableOnLoad){
                disable();
            }
        }

		function getValidationCallback(elem){
			return function(evt){
				elem.setValueFromBoundInput();
				var ok = elem.isValid()
				if (!ok && MAY_NOT_PROGRESS_PAST_INVALID_FIELD){
					elem.element.focus();
				}
			}
		}
        
        function wrapCallbackInTabIgnore(func) { 
            return function (e) {
                var code = (e.keyCode ? e.keyCode : e.which);
                if (code == 9) {
                    return;
                } else if (code == 13) {
                    e.preventDefault();
                }
                if($(this).closest('.input-field').hasClass('error')){
        	       func();
		}
            }
        }
        
        var resetButton = formElement.find("button[type='reset']");
        
        resetButton.on("click", function(evt){
            reset();
        });
		
		formElement.off("submit.loom").on("submit.loom", function(evt){ 
			onSubmit(evt);
		});
        
        function onSubmit(evt) {
            if (evt) {
                evt.preventDefault();
            }
			clearStateMessages();
			clearValidationMessages();
			loadFormValuesIntoModelFields();
			var isValid = validateFormAndReturnTrueIfValid();
			if (!isValid){
				showValidationMessage();
				if (JUMP_TO_INVALID_FIELD_ON_SUBMIT) {
					formElement.find('.input-field.error input').first().focus();
				}
				return;
			} else {
                if (!noSubmit) {
                    setStatePending();
                    doFormSubmission();
                }
			}
        }
		
        function reset() {
            clearStateMessages();
            clearValidationMessages();
            resetInputs();
        }
        
		function setupConfirmationValidators(){
			var lim = fields.length;
			for(var i = 0;i < lim; i++) {
				var otherFieldName = fields[i].getNameOfConfirmField();
				if (!otherFieldName) {
					continue;
				}
				fields[i].setupConfirmationValidators(getFieldByName(otherFieldName));
			}
		}
		
        function setupAutoPopulationOnSelection() {
            var lim = fields.length;
            for(var i = 0;i < lim; i++) {
				var otherFieldNames = fields[i].getNamesOfPopulationFields();
				if (!otherFieldNames || otherFieldNames.length == 0) {
					continue;
				}
                var requiredFields = {};
                var fieldLim = otherFieldNames.length;
                for (var j = 0;j<fieldLim; j++) {
                    requiredFields[otherFieldNames[j]] = getFieldByName(otherFieldNames[j]);
                }
                fields[i].setupAutoPopulation(requiredFields);
			}
        }
        
		function setupFieldDependentValidators() {
			var lim = fields.length;
			for(var i = 0;i < lim; i++) {
				var otherFieldName = fields[i].getNameOfDependencyField();
				if (!otherFieldName) {
					continue;
				}
				fields[i].setupFieldDependentValidators(getFieldByName(otherFieldName));
			}
		}
                
                function setupFieldCompareValidators() {
			var lim = fields.length;
			for(var i = 0;i < lim; i++) {
				var otherFieldName = fields[i].getNameOfCompareField();
				if (!otherFieldName) {
					continue;
				}
				fields[i].setupFieldCompareValidators(getFieldByName(otherFieldName));
			}
		}
        
        function setupCopyOnCheck() {
            var lim = fields.length;
            for(var i=0;i<lim;i++){
                var thisField = fields[i];
                if (!thisField.hasCopyOnCheck()){
                    continue;
                }
                var prefixes = thisField.getCopyOnCheckPrefixes();
                var fromPrefix = prefixes[0];
                var toPrefix = prefixes[1];
                var pairsOfFromToFields = [];
                for (var j = 0;j<lim;j++) {
                    var copyField = fields[j];
                    if (copyField.name.indexOf(fromPrefix) == 0) {
                        var thisPair = [];
                        var fieldName = copyField.name.replace(fromPrefix, '');
                        var toFieldName = toPrefix + fieldName;
                        var toField = getFieldByName(toFieldName);
                        if (!toField){
                            console.log("WARNING: Check your prefixes using the copy-on-check functionality in loom, a copyTo field was not found");
                            console.log("looking for field: " + toFieldName);
                            continue;
                        }
                        thisPair[0] = copyField;
                        thisPair[1] = toField;
                        pairsOfFromToFields.push(thisPair);
                    }
                }
                thisField.element.on("change", function(evt) {onCheckCopyFields(evt,pairsOfFromToFields);});
            }
        }

        function onCheckCopyFields(evt, fieldsAsPairsOfCopyFromCopyTo) {
            var target = $(evt.target);
            if (!target.is(":checked")){
                //blank all the copy to fields;
                var lim = fieldsAsPairsOfCopyFromCopyTo.length;
                for (var i = 0; i<lim;i++) {
                    var thisField = fieldsAsPairsOfCopyFromCopyTo[i][1];
                    thisField.value = "";
                    thisField.element.val("");
                    thisField.isValid();
                }
                return;
            }
            var lim = fieldsAsPairsOfCopyFromCopyTo.length;
            for (var i = 0; i<lim;i++) {
                var thisPair = fieldsAsPairsOfCopyFromCopyTo[i];
                thisPair[0].setValueFromBoundInput();
                var fromValue = thisPair[0].value;
                thisPair[1].value = fromValue;
                thisPair[1].element.val(fromValue);
                thisPair[1].isValid();
            }
        }
		
		function setupNormalInputs(){
            var formFieldContainers = formElement.find(FORM_FIELD_CONTAINER_SELECTOR);
            var lim = formFieldContainers.length;
            for(var i = 0;i<lim;i++){
                addInputField(formFieldContainers[i]);
            }
            
		}
		
		function setupRadioInputs(){
            // We'll end up reusing this code. but deactivating it for now.
            return;
			var radioButtonElements = formElement.find(":radio");
			var radioButtonNamesWithDuplicates = [];
			var lim = radioButtonElements.length;
			for (var i = 0; i < lim; i++) {
					var name = $(radioButtonElements[i]).attr("name");
					radioButtonNamesWithDuplicates.push(name);
			}
			var radioButtonNames =  $.grep(radioButtonNamesWithDuplicates, function(el, index) { //just uniquifies the list, looks scary but its not :)
																return index === $.inArray(el, radioButtonNamesWithDuplicates);
																	});
			lim = radioButtonNames.length;
			for(var i =0; i < lim; i++){
				var radioElemsWithThisName = formElement.find(":radio[name='" + radioButtonNames[i] + "']");
				addInputField(radioElemsWithThisName);
			}
		}
		
		function validateFormAndReturnTrueIfValid(){
			var isValid = true;
			var lim = fields.length;
			for(var i =0; i < lim; i++) {
				var validThisTime = fields[i].isValid();
				isValid = validThisTime && isValid;
			}
			return isValid;
		}
		
		function loadFormValuesIntoModelFields(){
			var lim = fields.length;
			for ( var i = 0; i < lim; i++){
				fields[i].setValueFromBoundInput();
			}
		}
		
        function IEXmlResponseFix(response) {
                //append to the dom and read back. This forces IE to turn the XML into something it can handle as it has to create nodes for the DOM.
                $("#loom-IE-fix").remove();
                var $div = $('<div id="loom-IE-fix" style="display:none"></div>');
                $('body').append($div);
                $div.html($(response.documentElement));
                $div.html($div.html());
                var $returnedHTML = $("#loom-IE-fix");
                $("#loom-IE-fix").remove();
                return $returnedHTML; 
        }
        
		function formSubmissionCallback(response){
            if (dataType == "xml" &&  (isIE || isSafari)) {
                response = IEXmlResponseFix(response);
            } 
            if (responseHandler) { //depending on config responseHandler module might not be loaded.
                response = responseHandler.processServerReponse(response);
            }
            var callbacksToDo = [];
            var err = (response.error && (typeof(response.error) != "function")); //TODO : check for error nodes in XML too?
			if (err) {
				clearStateMessages();
				setStateError();
                callbacksToDo = errorCallbacks.slice();//copy the array
                if (response.errorType == "hard_error") {
                    callbacksToDo.push.apply(callbacksToDo, hardErrorCallbacks);
                    setStateHardError();
                } else { //softerror
                    callbacksToDo.push.apply(callbacksToDo, softErrorCallbacks);
                    setStateSoftError();
                }
                
			} else {
				clearStateMessages();
				setStateSuccess();
                callbacksToDo = successCallbacks.slice();//copy the array

			}
            var lim = callbacksToDo.length;
            for (var i = 0;i < lim;i++) {
                callbacksToDo[i](response);//previously formElement.. this shouldn't break anything though.
            }
            
            if (!err) {
                if (disableOnSuccess) {
                    disable();
                }
                if (resetOnSuccess) {
                    reset();
                }
            }
		}
        
        function disable() {
            if (disableOnSuccess != "true") { //checking for literal value 'true' vs the name of a class. if we're calling this method then it's a truthy value
                formElement.closest("." + disableOnSuccess).addClass("disabled");
            }
            formElement.addClass("disabled");
            formElement.find("input").attr("disabled", "disabled");
            formElement.find("select").attr("disabled", "disabled");
            formElement.find("textarea").attr("disabled", "disabled");
            var $submitButton = formElement.find("button[type='submit']");
            $submitButton.data("loom-old-html", $submitButton.html() );
            $submitButton.addClass("loom-edit").html("Edit");
            $submitButton.on("click.loom", function(evt){evt.preventDefault(); enable(); } );
            $submitButton.attr("type", "button");
            $submitButton.removeAttr("disabled");
        }
        
        function enable(){
            if (disableOnSuccess != "true") { //checking for literal value 'true' vs the name of a class. if we're calling this method then it's a truthy value
                formElement.closest("." + disableOnSuccess).removeClass("disabled");
            }
            formElement.removeClass("disabled");
            formElement.find("input").removeAttr("disabled");
            formElement.find("select").removeAttr("disabled");
            formElement.find("textarea").removeAttr("disabled");
            var $submitButton = formElement.find("button");
            var oldHTML = $submitButton.data("loom-old-html");
            $submitButton.off("click.loom");
            $submitButton.addClass("loom-edit").html(oldHTML);
            $submitButton.attr("type", "submit");
        }
		
		function appendFormField(name,value,string){
			var object = {};
			object[name] = value;  
			if(!string){
				string = jQuery.param(object);
			} else {
				string = string+"&"+jQuery.param(object);
			}
			return string;
		}
		
		function doFormSubmission(){
			var result = {};
			var params = "";
			var lim = fields.length;
			for (var i = 0; i < lim; i++) {
				if (fields[i].noPost) {
					continue;
				}
                var formFieldAsString = fields[i].getFormDataString();
                if(!formFieldAsString){
                    continue;
                }
                if (params) {
                    params += "&"
                }
                params = params + formFieldAsString;
			}
			params = appendFormField("action", action, params);
			$.ajax({
				type: "POST",
				url: url,
				dataType: dataType,
				data: params
			}).done(function(response){
				formSubmissionCallback(response);
			}).error(function(xhr,error,thrown){
				result["error"] = error;
                result["xhr"] = xhr;
                result["thrown"] = thrown;
                formSubmissionCallback(result);
			});
		}
		
		function clearStateMessages(){
			formElement.removeClass(FORM_PENDING_CLASS);
			formElement.removeClass(FORM_ERROR_CLASS);
			formElement.removeClass(FORM_SUCCESS_CLASS);
            formElement.removeClass(FORM_SOFT_ERROR_CLASS);
            formElement.removeClass(FORM_HARD_ERROR_CLASS);
            $('body').removeClass('wait');
		}
		
		
		function setStatePending(){
            $('body').addClass('wait');
			formElement.addClass(FORM_PENDING_CLASS);
		}
		function setStateError(){
			formElement.addClass(FORM_ERROR_CLASS);
            $('body').removeClass('wait');
		}
        function setStateSoftError(){
            formElement.addClass(FORM_SOFT_ERROR_CLASS);
            $('body').removeClass('wait');
        }
        function setStateHardError(){
            formElement.addClass(FORM_HARD_ERROR_CLASS);
            $('body').removeClass('wait');
        }
		function setStateSuccess(){
			formElement.addClass(FORM_SUCCESS_CLASS);
            $('body').removeClass('wait');
		}
		
		function clearValidationMessages(){
			formElement.removeClass("invalid");
            $('body').removeClass('wait');
		}
		
		function showValidationMessage(){
			formElement.addClass("invalid");
		}
        
        function resetInputs(){
            var lim = fields.length;
            for(var i =0;i<lim;i++) {
                fields[i].reset();
            }
        }
		
		function addInputField(theField){
            var thisField = FormField(theField);
            if (thisField) {
                fields.push(thisField);
            }
		}
		
		function getFieldByName(name){
			var lim = fields.length;
			for (var i = 0; i < lim; i++) {
				if (fields[i].name == name) {
					return fields[i];
				}
			}
		}
        
        function addOnSuccessCallback(callback) {
            successCallbacks.push(callback);
        }
        
        function addOnErrorCallback(callback) {
            errorCallbacks.push(callback);
        }
        
        function addOnSoftErrorCallback(callback) {
            softErrorCallbacks.push(callback);
        }
        
        function addOnHardErrorCallback(callback) {
            hardErrorCallbacks.push(callback);
        }
		
		returnObject =  {
            url:url,
            dataType:dataType,
			showValidationMessage:showValidationMessage,
			clearValidationMessages:clearValidationMessages,
			setStatePending:setStatePending,
			setStateError:setStateError,
			setStateSuccess:setStateSuccess,
			doFormSubmission:doFormSubmission,
			formSubmissionCallback:formSubmissionCallback,
			loadFormValuesIntoModelFields:loadFormValuesIntoModelFields,
			validateFormAndReturnTrueIfValid:validateFormAndReturnTrueIfValid,
			fields:fields,
			setupFieldDependentValidators:setupFieldDependentValidators,
			getFieldByName:getFieldByName,
            formElement:formElement,
            addOnSuccessCallback:addOnSuccessCallback,
            addOnErrorCallback:addOnErrorCallback,
            addOnSoftErrorCallback:addOnSoftErrorCallback,
            addOnHardErrorCallback:addOnHardErrorCallback,
            successCallbacks:successCallbacks,
            errorCallbacks:errorCallbacks,
            disable:disable,
            enable:enable,
            reset:reset,
            onSubmit:onSubmit,
            disableIfDisableOnLoadSet:disableIfDisableOnLoadSet
		};
        if (Config.USE_LOOM_RESPONSE_HANDLER_BY_DEFAULT) { //TODO add a per form attribute to activate / deactivate this too.
            require(["loom/loomResponseHandler"], function(ResponseHandler){
                responseHandler = new ResponseHandler(returnObject);
            });
        }
        
        return returnObject;
	}
});



