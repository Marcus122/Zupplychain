define(["jquery", "./validators" , "./jquery-ui", "./loomConfig"],function($, ValidatorLib, ui, Config){




function FormField($inputElement, $typeName) { 

//input element we're passing in should maybe be a div class="input-field" rather that the input. and we put the data-loom-type etc. attr on that..
// that way we could handle compound input types... e.g. 2 inputs making up a field, 4 inputs for a CCard number etc.
//
	

	// 'Constants'
    this.VALIDATION_ELEMENT_SELECTOR            = Config.VALIDATION_ELEMENT_SELECTOR || ".input-field";
    this.NO_POST_ATTRIBUTE_NAME                 = "data-loom-no-post";
    this.VALIDATION_FUNCTIONS_ATTRIBUTE_NAME    = "data-loom-validators";
    this.REQUIRED_WHEN_ATTRIBUTE_NAME           = "data-loom-required-when";
    this.REQUIRED_WHEN_DISABLED_OTHERWISE_ATTRIBUTE_NAME = "data-loom-required-when-disabled-otherwise";
    this.CONFIRMATION_FLAG_ATTRIBUTE_NAME       = "data-loom-confirm";
    this.ADD_CONTROLS_ATTRIBUTE_NAME            = "data-loom-add-controls";
    this.POPULATE_ON_SELECT_ATTRIBUTE_NAME      = "data-loom-populate-on-select";
    this.POPULATE_FIELD_PREFIX                  = "loom-populate-field";
    this.COPY_ON_CHECK_ATTR_NAME                = "data-loom-copy-on-check";
    this.COPY_ON_CHECK_FROM_PREFIX_ATTR_NAME    = "data-loom-copy-on-check-from-prefix";
    this.COPY_ON_CHECK_TO_PREFIX_ATTR_NAME      = "data-loom-copy-on-check-to-prefix";
    this.POST_UP_COMBINED_AS_SEPARATE_ATTR_NAME = "data-loom-post-separately";
    this.DECIMAL_PLACES_ATTR_NAME               = "data-loom-decimal-places";
    this.GREATER_THAN_ATTR_NAME                 = "data-loom-greater-than";
    
    //Class properties
    this.value                  = "";
	this.element 			    = $($inputElement);
	this.name				    = this.element.attr("name");
	this.postName 			    = this.element.attr("data-loom-name"); //if undefined its fine.
	this.validationElement 	    = this.element.closest(this.VALIDATION_ELEMENT_SELECTOR);
    this.validWhenLastValidated = false; //cache the result of the last validation.
	this.type 				    = $typeName;
    this.noPost                 =  this.element.is("[" + this.NO_POST_ATTRIBUTE_NAME+ "]");
	this.validatorFunctions     = [];
}

// We've got classes inheritting off this so add any class methods to the prototype please.

FormField.prototype.init = function(){
    this.assignValidators();
    if (this.element.attr(this.ADD_CONTROLS_ATTRIBUTE_NAME)) {
        this.setupControls();
    }
}

FormField.prototype.reset = function(){
    this.value = "";
    this.clearValidationMessages();
}

// Grabs the required validators based on input type and data-loom-validators attribute.
// Loads these validators into this.validatorFunctions[] ready to be called later. 

FormField.prototype.assignValidators = function(){
    this.addRequiredValidatorIfNecessary(); //important that this is added first so that required is the first validator to fail.
    this.addTypeBasedValidator();
    this.addUserSpecifiedValidators();
    this.addHTML5AttributeBasedValidators();
	
}

FormField.prototype.addHTML5AttributeBasedValidators = function() {
    if (this.element.attr("max")) {
			var maxValue = this.element.attr("max");
			this.addValidator("max", ValidatorLib.getMaxValidator(maxValue, this.type));
		}
		
		if (this.element.attr("min")) {
			var minValue = this.element.attr("min");
			this.addValidator("min", ValidatorLib.getMinValidator(minValue, this.type));
		}
		
		if (this.element.attr("maxlength")) {
			var maxValue = this.element.attr("maxlength");
			this.addValidator("maxlength", ValidatorLib.getMaxlengthValidator(maxValue, this.type));
		}
		
		if (this.element.attr("minlength")) {
			var minValue = this.element.attr("minlength");
			this.addValidator("minlength", ValidatorLib.getMinlengthValidator(minValue, this.type));
		}
        
        if (this.element.data("pattern")) {
			var pattern = this.element.data("pattern");
			this.addValidator("pattern", ValidatorLib.getPatternValidator(pattern));
		}
}

FormField.prototype.addTypeBasedValidator = function(){
    if (this.type in ValidatorLib){
            this.addValidator(this.type, ValidatorLib[this.type]);
	}
}

FormField.prototype.addUserSpecifiedValidators = function(){
    var validatorString = this.element.attr(this.VALIDATION_FUNCTIONS_ATTRIBUTE_NAME);
	if (!validatorString){
		return;
	}
	var validatorNames = validatorString.split("|");
	var lim = validatorNames.length;
	for(var i = 0;i<lim;i++){
		if (validatorNames[i] in ValidatorLib) {
			var validator = ValidatorLib[validatorNames[i]];
			this.addValidator(validatorNames[i], validator);
		} else {
			// Log an ERROR?
		}
	} 
}

// Checks if the field is required, and if so adds a validator.
FormField.prototype.addRequiredValidatorIfNecessary = function(){   
    if (this.isRequired()){
        this.addValidator('required', ValidatorLib.required);
    }
}

FormField.prototype.isRequired = function(){
    return Boolean(this.element.attr("required"));
}

FormField.prototype.addValidator = function (name, func, thisValidatorShouldFireFirst) {
    if (thisValidatorShouldFireFirst) { //bit of a hack so we can make sure required validators fire first before regex based ones.
        this.validatorFunctions.unshift({'name': name, 'func': func});
    }
	this.validatorFunctions.push({'name': name, 'func': func});
}

// returns the name of the field that the inputField requires to know about for purposes of dependent validators e.g. required-when.
FormField.prototype.getNameOfDependencyField = function(){
			var theAttr = this.element.attr(this.REQUIRED_WHEN_ATTRIBUTE_NAME) || this.element.attr(this.REQUIRED_WHEN_DISABLED_OTHERWISE_ATTRIBUTE_NAME);
			if (theAttr) {
				if (theAttr.indexOf("=") != -1){  // attribute value is "someField=someValue" so we return 'someField'
					var FieldNameAndTestValue = theAttr.split('=');
					return FieldNameAndTestValue[0];
				}
				return theAttr; //else attribute value is just a field name so return it.
			}
			return false;
		}

FormField.prototype.getNameOfCompareField = function(){
    var theAttr = this.element.attr(this.GREATER_THAN_ATTR_NAME);
	return theAttr ? theAttr : false; //else attribute value is just a field name so return it.
}
		
// returns the name of the field that the inputField requires to know about for purposes of confirmation validators. e.g. a confirm-email field.
FormField.prototype.getNameOfConfirmField = function(){
			var theAttr = this.element.attr(this.CONFIRMATION_FLAG_ATTRIBUTE_NAME);
			if (theAttr) {
				return theAttr;
			}			
			return false;
		}
        
//this is a placeholder overwritten in the select class when a 'popupate on select' functionality flag is set
FormField.prototype.getNamesOfPopulationFields = function(){
    return [];
}

FormField.prototype.setupAutoPopulation = function(fields){
    return;
}

FormField.prototype.getCopyOnCheckPrefixes = function() {
    var result = [];
    result[0] = this.element.attr(this.COPY_ON_CHECK_FROM_PREFIX_ATTR_NAME);
    result[1] = this.element.attr(this.COPY_ON_CHECK_TO_PREFIX_ATTR_NAME);
    return result;
}

FormField.prototype.hasCopyOnCheck = function(){
    return this.element.attr(this.COPY_ON_CHECK_ATTR_NAME);
}
        
FormField.prototype.setupConfirmationValidators = function(otherField){
			var theAttr = this.element.attr(this.CONFIRMATION_FLAG_ATTRIBUTE_NAME);
			var validatorName = "confirm";
			var validatorFunction = ValidatorLib.getFieldsMatchValidator(otherField);
			this.addValidator(validatorName, validatorFunction);
			return;
		}
        
FormField.prototype.isNonEmpty = function() {
    return this.value;
}

FormField.prototype.setupControls = function() {
    return; // default input fields wont require any additional dom elements for manipulation.
}
      
		
FormField.prototype.setupRequiredWhen = function(otherField, theAttr){
			if (theAttr.indexOf("=") != -1){ 	// e.g. name=bob (fieldname=value)
				var FieldNameAndTestValue = theAttr.split('=');
				var validatorFunctionName = "depends-" + FieldNameAndTestValue[0];
				var validatorFunction = ValidatorLib.getRequiredWhenOtherFormEqualsValidator(otherField, FieldNameAndTestValue[1]);
				
				this.addValidator(validatorFunctionName, validatorFunction, true);
				return;
			}
			this.addValidator("depends-" + otherField.name ,ValidatorLib.getRequiredWhenOtherFieldSetValidator(otherField));
		}
		
FormField.prototype.setupRequiredWhenDisabledOtherwise = function(otherField, theAttr){
            this.bindFunctionToDisableThisInputDependentOnOtherFieldValue(otherField, theAttr);
			this.setupRequiredWhen(otherField, theAttr);
		}
        
FormField.prototype.getInputDisableOnEmptyOtherFieldFunction = function(otherField){
    var that = this;
    return function() {
        if (!otherField.getValue()  ) { //TODO can we replace with isNonEmpty();?
                that.disable();
			} else {
                that.enable();
		}
    }
}

FormField.prototype.getInputDisableWhenOtherFieldNotEqualValueFunction = function(otherField, testValue){
    var that = this;
    return function() {
        if(otherField.element.val() == testValue) {
					that.enable();
				} else {
					that.disable();
        }
    }
}
       
FormField.prototype.bindFunctionToDisableThisInputDependentOnOtherFieldValue = function(otherField, theAttr) {
        var that = this;
        var onChangeFunction;
		if (theAttr.indexOf("=") != -1){ // string is of the form "someField=someValue" so thats what we'll test for
			var FieldNameAndTestValue = theAttr.split('=');
			var testValue = FieldNameAndTestValue[1];
            onChangeFunction = this.getInputDisableWhenOtherFieldNotEqualValueFunction(otherField, testValue);
		} else {    // we just need to test for a truthy value.
			onChangeFunction = this.getInputDisableOnEmptyOtherFieldFunction(otherField);
		}
        otherField.element.on("change", onChangeFunction);
        //Call the onchange function now to set the enabled/disabled state correctly.
        onChangeFunction();
}
		
FormField.prototype.setupFieldDependentValidators = function(otherField){
			
    var theAttr = this.element.attr(this.REQUIRED_WHEN_ATTRIBUTE_NAME);
    if(theAttr) {
        this.setupRequiredWhen(otherField, theAttr);
        return;
    }
    theAttr = this.element.attr(this.REQUIRED_WHEN_DISABLED_OTHERWISE_ATTRIBUTE_NAME);
    if (theAttr) {
        this.setupRequiredWhenDisabledOtherwise(otherField, theAttr);
        return;
	}
			
}

FormField.prototype.setupFieldCompareValidators = function(otherField){
	var validatorFunctionName = "compare-" + otherField.name;
	var validatorFunction = ValidatorLib.getGreaterThanOtherField(otherField);
	this.addValidator(validatorFunctionName, validatorFunction, true);		
}
		
//removes the passed in prefix from the form field name.
FormField.prototype.getName = function(prefixToRemove){ 
    var theName = this.postName || this.name; //fallback to form input name if no postName was set.
    if (!prefixToRemove) {
        return theName;
    }
    if (theName.indexOf(prefix) != -1) { 
        return theName.slice(prefix.length, theName.length); //remove the prefix and return the name;
    }
    return theName;
}

FormField.prototype.getValue = function(){
    this.setValueFromBoundInput();
    return this.value;
}

FormField.prototype.removeClassesThatStartWithErrorFromValidationElement = function(){
        var classes = this.validationElement.attr("class").split(' ');
        var lim = classes.length;
        for(var i =0;  i < lim; i++){
            if (classes[i].indexOf('error') == 0){
                this.validationElement.removeClass(classes[i]);
            }
        }
    }
		
FormField.prototype.clearValidationMessages = function(){
        this.validationElement.removeClass("success");
        this.validationElement.removeClass("error");
        this.validationElement.removeClass("error-depends");
        this.removeClassesThatStartWithErrorFromValidationElement();
    }
		
FormField.prototype.showSuccessMessage = function(){
            this.validationElement.addClass("success");
    }
		
FormField.prototype.showValidationMessage = function(nameOfValidatorThatFailed){
        if (nameOfValidatorThatFailed.indexOf("depends-") != -1){
            this.validationElement.addClass("error-depends");
        }
        this.validationElement.addClass("error");
        this.validationElement.addClass("error-" + nameOfValidatorThatFailed);
    }
		
		// TODO : add if !isRequired && value = blank return true... just doesn't work for number
FormField.prototype.isValid = function(){
        this.clearValidationMessages();
        if (this.element.attr("disabled")) {
            return true;
        }
		this.setValueFromBoundInput();
        var lim = this.validatorFunctions.length;
        for(var i = 0; i < lim; i++){
            var isValid = this.validatorFunctions[i].func(this.value);
            this.validWhenLastValidated = isValid;
            if (!isValid) {
                this.showValidationMessage(this.validatorFunctions[i].name);
                return false;
            }
        }
        this.showSuccessMessage();
        return true;
    }
		
FormField.prototype.setValueFromBoundInput = function() { 
			this.value = this.element.val(); 
		}
		
FormField.prototype.disable = function(){
        this.element.attr("disabled","disabled");
        this.clearValidationMessages();
        this.validationElement.addClass("disabled");
    }
		
FormField.prototype.enable = function(){
        this.element.removeAttr("disabled");
        this.validationElement.removeClass("disabled");
    }
    
    
FormField.prototype.getFormDataString = function() {
            var name = this.getName();
			var object = {};
			object[name] = this.getValue();  
			var string = jQuery.param(object);
			return string;
	}

    
    
// helper to handle the inheritance.   
function inherit(o1, o2){
	o1.prototype =  new o2(); //Object.create(o2.prototype);//ie 8 falls over on create
	o1.prototype.constructor = o1;
}


// ***********  Child Classes of FormField. *********************** //


// ************  Radio Button TODO: handle multiples?

function RadioButton($elem) {
  FormField.call(this,$elem, "radio"); // call super constructor.
  this.numRadioButtons = this.element.length;
}

// subclass extends superclass,
inherit(RadioButton, FormField );

RadioButton.prototype.disable = function(){ 
    this.validationElement.addClass("disabled");
    this.element.each(function(){
       $(this).element.attr("disabled", "disabled"); 
    });
 }
 
 RadioButton.prototype.enable = function(){ 
    this.validationElement.removeClass("disabled");
    this.element.each(function(){
       $(this).element.removeAttr("disabled");
    });
 }
 
 RadioButton.prototype.getFormDataString = function(){
    if($(this.element).is(':checked')){
        return FormField.prototype.getFormDataString.apply(this);
    }
}


 // ************* Checkbox 
 
 // constructor (add any class specific members in here with this.myvar = whatever)
 function Checkbox($elem) {
    FormField.call(this, $elem, "checkbox");
 }
 
 // inherit from input field
 inherit(Checkbox,FormField);
 
 // override any functions by adding to prototype.
 Checkbox.prototype.setValueFromBoundInput = function() {
    this.value = this.element.is(":checked")
 }
 
// ************  CreditCardNumber
 
function CreditCardNumber($elem) {
    FormField.call(this, $elem, "creditCardNumber");
}
 
inherit(CreditCardNumber, FormField );

CreditCardNumber.prototype.setValueFromBoundInput = function() {  
	var theInput = this.element.val();
    cleanInput = theInput.replace(/-/g, "").replace(/\ /g,""); //strip hyphens and spaces to allow the user to enter the number however they like.
    this.value = cleanInput;
} 

// ************* CreditCardExpiry

function MonthAndYear($elem) {
    FormField.call(this, $elem, "monthAndYear");
    // We assume the first input is 'month' so we'll just try and strip a trailing month.
    var nameSuffixLocation = this.name.indexOf("-month");
    if(nameSuffixLocation != -1) {
        this.name = this.name.slice(0,nameSuffixLocation);
    }
    this.monthElement = $($elem[0]); 
    this.yearElement = $($elem[1]);
    this.postSeparately =  this.element.is("[" + this.POST_UP_COMBINED_AS_SEPARATE_ATTR_NAME + "]");
}

inherit(MonthAndYear, FormField );

MonthAndYear.prototype.setValueFromBoundInput = function() {  
    // We need to take a month and year and concatenate them into the format expected. YYYY-MM, We use the ISO format for month from the html5 spec 
    this.value = this.yearElement.val() + "-" + this.monthElement.val();
}


MonthAndYear.prototype.getFormDataString = function() {
    if (this.postSeparately) {
        var monthName = this.monthElement.attr("name");
        var monthValue = this.monthElement.val();
        var yearName = this.yearElement.attr("name");
        var yearValue = this.yearElement.val();
        
        var object = {};
		object[monthName] = monthValue;
        object[yearName] = yearValue;
		var string = jQuery.param(object);
		return string;
    }
    else {
        return FormField.prototype.getFormDataString.apply(this); //call the parent method, business as usual.
    }
}

// ************* Numeric

function Numeric($elem) {
    FormField.call(this, $elem, "Numeric");
    this.maxValue = Number.MAX_VALUE;
    this.minValue = -Number.MAX_VALUE;
    if (this.element.attr("max")) {
		this.maxValue = this.element.attr("max");
    }
    if (this.element.attr("min")) {
		this.minValue = this.element.attr("min");
    }
    
}

inherit(Numeric, FormField);

Numeric.prototype.setupControls = function() {
    //TODO create a + and - button and add in a DIV after the input, then wire up onclicks.
    var parent = this.element.parent();
    this.validationElement.addClass("has-controls");
    var incButton = $("<button type='button' class='inc' tabindex='-1' data-sign='plus'>+</button>");
    var decButton = $("<button type='button' class='dec' tabindex='-1' data-sign='minus'>-</button>");
    var container = $("<div class='controls'></div>");
    container.append(decButton);
    container.append(incButton);
    this.validationElement.append(container);
    
    incButton.on("click", this.getButtonClickFunction(1));
    decButton.on("click", this.getButtonClickFunction(-1));
}


Numeric.prototype.getButtonClickFunction = function(numberToAdd) {
    var that=this;
    return function() {
        that.setValueFromBoundInput();
        if (that.value == "") { //bugfix to get out or any NaN weirdness.
            that.isValid(); //still validate on any input change or attempted change to give the user some feedback.
            return;
        }
        var newVal = parseInt(that.element.val(), 10) + numberToAdd;
        if (newVal > that.maxValue) {
            that.element.val(parseInt(that.maxValue,10));
            that.value = that.maxValue;
            that.isValid();
            return;

        } else if(newVal < that.minValue) { 
            that.element.val(parseInt(that.minValue,10));
            that.value = that.minValue;
            that.isValid();
            return; 
        }
        that.element.val(parseInt(that.element.val(), 10) + numberToAdd); //TODO what happens if non numeric value in the field?
        that.value = (parseInt(that.value,10) + numberToAdd); // we store internally as string so that 0 != false for validation.
        that.element.change();
        that.isValid();//is this needed along with the change() above?
    }
}

// ************  Sap Date
function sapDate($elem){
                FormField.call(this, $elem, "sapDate");
}
inherit(sapDate,FormField);
sapDate.prototype.setValueFromBoundInput = function() {  
                var value = this.element.val();
                this.value = value.substring(6,10) + value.substring(3,5) + value.substring(0,2);
}


// ************* Date

//Date is a reserved word so we use the name ADate.
function ADate($elem) {
    FormField.call(this, $elem, "date");
}

inherit(ADate, FormField);

ADate.prototype.setValueFromBoundInput = function(input) {
    var contents = this.element.val();
    if (input != undefined) {
        contents = input; //optionally passing in a value;
    }
    // if in format DD/MM/YYYY, convert to YYYY-MM-DD for the back end - in modern browsers the browser will convert to YYYY-MM-DD so we need to preserve that.
    if (contents.indexOf("/") != -1) {
        var components = this.element.val().split("/");
        var year = components[2];
        var month = components[1]
        var day = components[0];
        this.value = year + '-' + month + '-' + day;
    } else {
        this.value = this.element.val(); // just assume everythings ok, the validator will pick up any errors.
    }
}

ADate.prototype.doesBrowserSupportDateField = function() {
    var input = document.createElement('input');
    input.setAttribute('type','date');
    var notADateValue = 'not-a-date';
    input.setAttribute('value', notADateValue); 
    return !(input.value === notADateValue);
}

ADate.prototype.setupControls = function() {
    var that = this;
    var dateFormat = "dd/mm/yy";
    if (this.doesBrowserSupportDateField()) { //if the browser supports HTML5 date type, we need to use the spec format of yyyy-mm-dd;
        dateFormat = "yy-mm-dd"
    }
    var minDate = this.element.attr('min') ? new Date(this.element.attr('min')) : null;
    var maxDate = this.element.attr('max') ? new Date(this.element.attr('max')) : null;
    //require(["loom/jquery-ui"], function(ui){ //already included in define now... if load times become a problem uncomment this.
        //debugger;
        if(this.element.hasClass('hasDatepicker')){
            this.element.datepicker( "option", "minDate", minDate );
            this.element.datepicker( "option", "maxDate", maxDate );
        }
        that.element.datepicker({
            inline: true,
            dateFormat: dateFormat,
            onSelect: function(dateText, inst) {
                if(dateText !== inst.lastVal){
                    $(this).change();
                }
                that.setValueFromBoundInput(dateText);
                that.isValid();
            },
            minDate: minDate,
            maxDate: maxDate
     //    });
    });
}


// SELECT *******************************************

//TODO : we are implementing the select class mainly to handle the auto populating on select.

function Select($elem) {
    FormField.call(this, $elem, "select");
    this.fieldsToPopulate = {};
}

inherit(Select, FormField);

Select.prototype.getNamesOfPopulationFields = function(){
    //bit of faffing around to get the field names, find an option with data attributes with the expected prefix.
    //This is in case there are any 'blank' options in there.
    var populateFieldPrefixAsCamelCase = $.camelCase(this.POPULATE_FIELD_PREFIX);
    var options = this.element.find('option');
    var optionDataToExtractNames = false;
    var lim = options.length;
    for (var i =0;i<lim && !optionDataToExtractNames; i++){
        var thisOptionData = $(options[i]).data();
        
        for (var key in thisOptionData) {
            if(key.indexOf(populateFieldPrefixAsCamelCase) == 0) { //We found an option with the field names to be populated so we'll use this one.
                optionDataToExtractNames = thisOptionData;
            }
        }
    }
    if (!optionDataToExtractNames) { //we failed to find any population data so blank list.
        return [];
    }
    var fieldNames = [];
    var i = 0;
    for ( var key in optionDataToExtractNames) {
        if(key.indexOf(populateFieldPrefixAsCamelCase) == 0){
            //strip the prefix and read the fieldName.
            var fieldNameCamelCase = key.replace(populateFieldPrefixAsCamelCase, '');
            var fieldName =  fieldNameCamelCase.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(); //convert firstNameLong to first-name-long
            fieldNames[i++] = fieldName;
        }
    }
    return fieldNames;
}

Select.prototype.setupAutoPopulation = function(fields){
    if (! this.element.attr(this.POPULATE_ON_SELECT_ATTRIBUTE_NAME)) { //this attribute is the flag that this is an auto populating field.
        return;
    }
    this.fieldsToPopulate = fields; // Store these fields internally somewhere so that they can be accessed when population time comes.
    // assign a callback to the onchange() event.
    var that = this;
    this.element.on("change", function(){
        that.onChangePopulateFields(that);
    });

}

Select.prototype.onChangePopulateFields = function(that){
    // grab the option that was selected.
    var option = that.element.find(":selected");
    // read its data into a dictionary
    
    for(var fieldName in that.fieldsToPopulate) {
        var thisFieldValue = option.data(that.POPULATE_FIELD_PREFIX + "-" + fieldName);
        var thisField = that.fieldsToPopulate[fieldName];
        if (!thisField) {
            console.log("Loom.js - warning - populating field failed, check data-loom-populate-field attributes for fieldName:");
            console.log(fieldName);
        } else {
            thisField.value = thisFieldValue;
            thisField.element.val(thisFieldValue);
            thisField.isValid();
        }
    }
}

// Decimal

function Decimal($elem) {
    FormField.call(this, $elem, "decimal");
    var rawNum = this.element.attr(this.DECIMAL_PLACES_ATTR_NAME);
    var parsedNum = parseInt(rawNum,10);
    this.dp = isNaN(parsedNum) ? 2 : parsedNum; //default to 2 if we don't get a number back.
}

inherit(Decimal, FormField);

Decimal.prototype.setValueFromBoundInput = function(){
    //read the value and parse to float, then set it to the d.p.
    
    var asString = this.element.val();
    var asFloat = parseFloat(asString, 10);
    this.value = asFloat.toFixed(this.dp);
    if (isNaN(asFloat)) {
        this.value=""; //don't allow an invalid input to get into the 'value', just default to blank.
    }
    if (this.element.is(":focus")) { //if we're still editing the value, then don't read it back out, so the user can edit it.
        if (isNaN(asFloat)) {
            this.value = NaN; //and it it was invalid, set the internal value to something that will fail the decimal validator.
        }
        return;
    }
    this.element.val(this.value); //read back out our nice decimalled value.
};

function Integer($elem){
    FormField.call(this, $elem, "integer");
}
inherit(Integer, FormField);
Integer.prototype.setValueFromBoundInput = function(){
    var asString = this.element.val();
    var asInt = parseInt(asString, 10);
    this.value = asInt;
    if (isNaN(asInt)) {
        this.value=""; //don't allow an invalid input to get into the 'value', just default to blank.
    }
     if (this.element.is(":focus")) {
        if (isNaN(asInt)) {
            this.value = NaN; //and it it was invalid, set the internal value to something that will fail the decimal validator.
        }
        return;
    }
    this.element.val(this.value);
}
 
// the factory.

function getFormField($formFieldContainer) {
	
	var FIELD_TYPE_ATTR_NAME = "data-loom-type";
    var DEFAULT_FIELD_TYPE = 'text';
	
	// Keep a list of constructors for each type that we can match up.
	
	var typesToConstructors = {
        'hidden' : FormField,
		'text' : FormField,
        'textarea' : FormField,
		'date' : ADate,
		'month' : FormField,
		'select' : Select,
		'radio' : RadioButton,
        'checkbox' : Checkbox,
		'creditCardNumber' : CreditCardNumber,
		'monthAndYear' : MonthAndYear,
        'number' : Numeric,
        "sapDate" : sapDate,
        "decimal" : Decimal
	}
    
    var $inputElement = $($formFieldContainer).find("input");
    //if there's more than one input in the container, getType should still work fine.    
    //and we'll be passing a list of inputs into a FormField child type that's expecting a list so everything should still work fine.
    
    if (!$inputElement.length){
        $inputElement = $($formFieldContainer).find("select");
    }
    
    if (!$inputElement.length) {
        $inputElement = $($formFieldContainer).find("textarea");
    }
    
    //if still nothing then its an empty div so just return null
    if (!$inputElement.length) {
        return null;
    }
    
    var Class = typesToConstructors[DEFAULT_FIELD_TYPE]; //set a default as fallback
	var type = determineType($($inputElement));
    if (type in  typesToConstructors) {
        Class = typesToConstructors[type];
    }

	var formField = new Class($inputElement, type);
	formField.init();
    return formField;
    
    function determineType(inputElement){
		// Top priority check if someone set a data-loom-field-type.
        if (inputElement.is("["+ FIELD_TYPE_ATTR_NAME+"]")) {
			return  inputElement.attr(FIELD_TYPE_ATTR_NAME);
		}
        
        if (inputElement.is("textarea")) {
            return "textarea";
        }
        
		//Next we look at the type of the first input 
		if (inputElement.is("[type]")) {
			return inputElement.attr("type");
		}
        
        //TODO, dont like this 'if all else fails, its a select'.. we should properly detect the type.
		return "select";
	}
    
}
 return getFormField; // The module returns the factory function.
 
});











