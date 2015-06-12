// o1 inherits all o2's prototype methods.
function inherit(o1, o2){
	o1.prototype = Object.create(o2.prototype);
	o1.prototype.consctructor = o1;
}



// Shape - superclass - this is the constructor where we add class properties.
function Shape(x,y) {
  this.x = x;
  this.y = y;
  this.name = "shape";
}

// We add methods to the prototype.
Shape.prototype.move = function(x, y) {
  this.x += x;
  this.y += y;
  Shape.numberOfTimesShapesHaveMoved++;
  console.info('Shape moved.');
};

Shape.prototype.getCoords = function(){
	console.info("The coords of this shape are: " + this.x + ", " + this.y);
}

// Static properties are added like this, basically as properties of the constructor function.
Shape.staticProperty = 0;





// Rectangle - subclass constructor
// we add methods to the prototype.
// we add properties in the constructor.

function Rectangle(x,y) {
  Shape.call(this,x,y); // call super constructor.
  this.name = "rectangle";
  this.rectangleOnlyProperty = "I'm a rectangle, a shape doesn't have this property.";
}

// subclass extends superclass,
inherit(Rectangle, Shape);

Rectangle.prototype.move = function(){ console.info("rectangle moved"); }


var rect = new Rectangle(2,3);
var shap = new Shape(4,4);

console.log('Is rect an instance of Rectangle? ' + (rect instanceof Rectangle)); // true
console.log('Is rect an instance of Shape? ' + (rect instanceof Shape)); // true
rect.getCoords();
shap.getCoords();
rect.move();
shap.move();
console.log(rect.name);
console.log(shap.name);



/*

This is a list of the types that will be supported.

Name.
AddressLine.
PostCode.
Gender.
CCNumber.
CCExpiryDate.
CVC.
DateOfBirth.

*/


//
//   	This recieves an inputField div in the constructor.
//		This inputField div may have a 'data-loom-input-type' attr for some complex multi input types so we can use this.
//		If not, we can inspect the input Element(s) and use their type attr.
//		text, date, etc are simple we can just read them off the fields.
//		For Selects, if all the other tests fail, then its a select!
//		
//


function getFormField($inputElement) {
	
	var FIELD_TYPE_ATTR_NAME = "data-loom-field-type";
    var DEFAULT_FIELD_TYPE = 'text';
	
	function determineType(inputElement){
		// Top priority check if someone set a data-loom-field-type.
		if element.hasAttr(FIELD_TYPE_ATTR_NAME) {
			return  element.attr(FIELD_TYPE_ATTR_NAME);
		}
		//Next we look at the type of the first input 
		if (element.is("[type]")) {
			return element.attr("type");
		}
        //TODO, should explicitly set to select and assume text otherwise.
		return "select";
	}
	
	// Keep a list of constructors for each type that we can match up.
	
	var typesToConstructors = {
        'hidden' : InputField,
		'text' : InputField,
		'date' : InputField,
		'month' : InputField,
		'select' : Select,
		'radio' : Radio,
		'creditCardNumber' : creditCardNumber,
		'creditCardExpiry' : creditCardExpiry
	}
	
	var type = determineType($inputElement);
    var Class = typesToConstructors(DEFAULT_FIELD_TYPE);
    if (type in  typesToConstructors) {
        var Class = typesToConstructors[type];
    }
	var formField = new FormField($inputElement, type);
	formField.init();
    return FormField;
}



function FormField($inputElement, $typeName) { 

//input element we're passing in should maybe be a div class="input-field" rather that the input. and we put the data-loom-type etc. attr on that..
// that way we could handle compound input types... e.g. 2 inputs making up a field, 4 inputs for a CCard number etc.
//
// the types that we'll have coming in could be all the basic input types, but the complex ones are basically.
// creditCardDate... this is two input fields, one month and one day, and then in the back end we can roll them up into a single field.
// RadioButtons.. this will be a list of fields.. but I think everything will still work.

	
    //Class properties added here.
    var VALIDATION_ELEMENT_SELECTOR = ".input-field";
    var NO_POST_ATTRIBUTE_NAME = "data-loom-no-post";
	var value;
	var name;           //the name of the form-input
	var postName;       // the name the server expects
	var element = $();
	var validationElement = $();
	var validatorFunctions = [];
	var isRequired = false;
	var type = "";
	var noPost = false;
	
	this.element 			= $($inputElement);
	this.name				= element.attr("name");
	this.postName 			= element.attr("data-loom-name"); //if undefined its fine.
	this.validationElement 	= element.closest(VALIDATION_ELEMENT_SELECTOR);
	this.type 				= $typeName;
    if (this.element.attr(this.NO_POST_ATTRIBUTE_NAME)) {
		this.noPost = true; //This is a flag to not post up the value;
	}

}

//We add the class methods here

//GENERIC init, any type specific stuff goes in child classes, but its still safe for them to call this.
FormField.prototype.init = function(){
    this.assignValidators();
}


// Grabs the required validators based on input type and data-loom-validators attribute.
// Loads these validators into this.validatorFunctions[] ready to be called later. 

FormField.prototype.assignValidators = function(){
    
    this.addTypeBasedValidator();
    this.addUserSpecifiedValidators();
    this.addHTML5AttributeBasedValidators();
	this.addRequiredValidatorIfNecessary();
}

FormField.prototype.addHTML5AttributeBasedValidators = function() {
    if (this.element.attr("max")) {
			var maxValue = element.attr("max");
			addValidator("max", ValidatorLib.getMaxValidator(maxValue));
		}
		
		if (this.element.attr("min")) {
			var minValue = element.attr("min");
			addValidator("min", ValidatorLib.getMinValidator(minValue));
		}
		
		if (this.element.attr("maxlength")) {
			var maxValue = element.attr("maxlength");
			addValidator("maxlength", ValidatorLib.getMaxlengthValidator(maxValue));
		}
		
		if (this.element.attr("minlength")) {
			var minValue = element.attr("minlength");
			addValidator("minlength", ValidatorLib.getMinlengthValidator(minValue));
		}
}

FormField.prototype.addTypeBasedValidator = function(){
    if (this.type in ValidatorLib){
            this.addValidator(this.type, ValidatorLib[this.type]);
	}
}

FormField.prototype.addUserSpecifiedValidators = function(){
    var validatorString = this.element.attr("data-loom-validators");
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
    return Boolean(this.element.attr("required");
}

FormField.prototype.addValidator = function (name, func) {
	this.validatorFunctions.push({'name': name, 'func': func});
}

// returns the name of the field that the inputField requires to know about for purposes of dependent validators e.g. required-when.
FormField.prototype.getNameOfDependencyField = function(){
			var theAttr = this.element.attr("data-loom-required-when") || this.element.attr("data-loom-required-when-disabled-otherwise");
			if (theAttr) {
				if (theAttr.indexOf("=") != -1){ 
					var FieldNameAndTestValue = theAttr.split('=');
					return FieldNameAndTestValue[0];
				}
				return theAttr;
			}
			return false;
		}
		
// returns the name of the field that the inputField requires to know about for purposes of confirmation validators. e.g. a confirm-email field.
FormField.prototype.getNameOfConfirmField = function(){
			var theAttr = this.element.attr("data-loom-confirm");
			if (theAttr) {
				return theAttr;
			}			
			return false;
		}

FormField.prototype.setupConfirmationValidators = function(otherField){
			var theAttr = this.element.attr("data-loom-confirm");
			var validatorName = "confirm";
			var validatorFunction = ValidatorLib.getFieldsMatchValidator(otherField);
			this.addValidator(validatorName, validatorFunction);
			return;
		}
        
      
		
FormField.prototype.setupRequiredWhen = function(otherField, theAttr){
			if (theAttr.indexOf("=") != -1){ 	// e.g. name=bob (fieldname=value)
				var FieldNameAndTestValue = theAttr.split('=');
				var validatorFunctionName = "depends-" + FieldNameAndTestValue[0];
				var validatorFunction = ValidatorLib.getRequiredWhenOtherFormEqualsValidator(otherField, FieldNameAndTestValue[1]);
				
				this.addValidator(validatorFunctionName, validatorFunction);
				return;
			}
			this.addValidator("depends-" + otherField.name ,ValidatorLib.getRequiredWhenOtherFieldSetValidator(otherField));
		}
		
FormField.prototype.setupRequiredWhenDisabledOtherwise = function(otherField, theAttr, that){
			if (theAttr.indexOf("=") != -1){
				var FieldNameAndTestValue = theAttr.split('=');
				var testValue = FieldNameAndTestValue[1];
				otherField.element.on("change", function() {
					if(otherField.element.val() == testValue) {
						that.enable();
					} else {
						that.disable();
					}
				});
			} else {
				otherField.element.on("change", function() {
					if (otherField.element.val() == "" || (otherField.type == "checkbox" && !otherField.element.is(":checked"))  ) {
						that.disable();
					} else {
						that.enable();
					}
				});
			}
			setupRequiredWhen(otherField, theAttr, that);
		}
		
FormField.prototype.setupFieldDependentValidators = function(otherField){
			
			var theAttr = this.element.attr("data-loom-required-when");
			if(theAttr) {
				setupRequiredWhen(otherField, theAttr, this);
				return;
			}
			theAttr = this.element.attr("data-loom-required-when-disabled-otherwise");
			if (theAttr) {
				setupRequiredWhenDisabledOtherwise(otherField, theAttr, this);
				return;
			}
			
		}
		
//removes the passed in prefix from the form field name.
FormField.prototype.getName = function(prefixToRemove){ 
				var safePrefix = prefixToRemove || "";
				var theName = this.postName || this.name; //fallback to form input name if no postName was set.
                if (theName.indexOf(prefix) != -1) { 
                    return theName.slice(prefix.length, theName.length); //remove the prefix and return the name;
                }
				return theName;
		}

FormField.prototype.getValue = function(){
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
        var lim = this.validatorFunctions.length;
        for(var i = 0; i < lim; i++){
            var isValid = this.validatorFunctions[i].func(this.value);
            if (!isValid) {
                this.showValidationMessage(this.validatorFunctions[i].name);
                return false;
            }
        }
        this.showSuccessMessage();
        return true;
    }
		
FormField.prototype.setValueFromBoundInput = function() { 
			this.value = element.val(); 
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
    
    
// helper to handle the inheritance.   
function inherit(o1, o2){
	o1.prototype = Object.create(o2.prototype);
	o1.prototype.consctructor = o1;
}


function RadioButtonInputField($elem) {
  InputField.call(this,$elem); // call super constructor.
  this.type = "radio";
  this.rectangleOnlyProperty = "I'm a rectangle, a shape doesn't have this property.";
}

// subclass extends superclass,
inherit(, Shape);

RadioButton.prototype.disable = function(){ 
    this.element.each(function(){
       $(this).disable(); 
    });
 }















