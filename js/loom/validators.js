define({
	
	getMaxValidator : function(maxVal, fieldType){
        if (fieldType == "date") { //expecing a date format of yyyy-mm-dd, this way simple string comparison will work
            return function(input) {
                return input <= maxVal;
            }
        }
		return function(input) {
			if (input === undefined || input === NaN || input === "") {
				return true;
			}
			return parseFloat(input,10) <= parseFloat(maxVal,10);
		}
	},
	getMinValidator : function (minVal, fieldType){
       if (fieldType == "date") {
            return function(input) {
                return input >= minVal;
            }
        }
		return function(input) {
			if (input === undefined || input === NaN || input === "") {
				return true;
			}
			return parseFloat(input,10) >= parseFloat(minVal,10);
		}
	},
	getMaxlengthValidator : function (maxLength, fieldType){
		return function(input) {
			return input.length <= maxLength;
		}
	},
	getMinlengthValidator : function (minLength, fieldType){
		return function(input) {
			return input.length >= minLength;
		}
	},
	getPatternValidator : function (pattern){
		return function(input) {
			if(!input) return true;
			var regex = new RegExp(pattern.replace('((','{').replace('))','}'));
			return regex.test(input);
		}
	},
	
	//HTML5 validator types, these are looked up by the 'type' of the input so names must match HTML5 spec input types.
	email : function(input) {
        if (input == "") { //blank inputs are 'valid'
            return true;
        }
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(input);
	},
	number : function(input) {
        if (input === "") { //blank inputs are always 'valid'
            return true;
        }
		var re= /^[-+]?[0-9]*\.?[0-9]*/
		return re.test(input);
	},
	date : function(input){ // YYYY-MM-DD
		var re= /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/
		return re.test(input);
	},
	datetime : function(input){
		return false;
	},
	'datetime-local' : function(input){
		return false;
	},
	month : function(input){
		var re= /^\d{4}-\d{2}$/
		return re.test(input);
	},
	tel : function(input) {
        if (input == "") { //blank inputs are 'valid'
            return true;
        }
        //accept numbers, spaces, dashes, brackets and + sign. Expect 10-16 numbers once all other chars are stripped.
		var reOnlyValidChars= /^[0-9()-+\ ]+$/;
        var onlyNumbers = input.toString().replace(/[^0-9]/g, "");
		return reOnlyValidChars.test(input) && onlyNumbers.length >= 10 && onlyNumbers.length <= 16
	},
	text : function(input) {
		return true;
	},
	time : function(input){
		return false;
	},
	url : function (input){
		return true;
	},
	
	// end HTML5 types
	decimal : function(input) {
        if (input === "") { //blank inputs are always 'valid'
            return true;
        }
		var re= /^[-+]?[0-9]*\.?[0-9]*/
		return re.test(input);
    },
	name : function(input) {
		var re = /^[-A-z ']+$/ // Alpha, hyphens, spaces, apostrophe's
		return re.test(input);
	},
    integer : function(input) {
        var n = Number(input);
        return n === Math.floor(n) && n >= 0;
    },
	mobileNumber : function(input) {
		return input;
	},
	UKPostCode : function(input) {
        var re= /^[A-z]{1,3}[0-9]{1,3}[ ]*[0-9]{1,3}[A-z]{1,3}$/ ;
 		return re.test(input);
	},
	required : function(input) {
        if (typeof input == "undefined" || input === false) {
            return false;
        }
		return (input.toString()); 
	},
	passwordPolicyStrict : function(input) {
		var reHasUppercase = /[A-Z]+/;
		var reHasLowercase = /[a-z]+/;
		var reNumber = /[0-9]+/;
		var longEnough = (input.length >= 8);
		return (reHasUppercase.test(input) && reHasLowercase.test(input) && reNumber.test(input) && longEnough);
	},
    passwordPolicyNormal : function (input) { //8+ characters, > one num, > one Ucase letter, no spaces
        if (!input) {
            return false;
        }
        var re = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{8,}$/;
        var hasSpaces = input.indexOf(" ") != -1 ;
        if (hasSpaces) {
            return false;
        }
        return re.test(input);

    },
	creditCardNumber : function(input) {
		
		var reg = /\b(?:3[47]\d|(?:4\d|5[1-5]|65)\d{2}|6011)\d{12}\b/
		return reg.test(input);
	},
    monthAndYearInFuture : function(input) {
        //expecting YYYY-MM format. 
        var today = new Date();
        var thisYear = today.getFullYear();
        var thisMonth = today.getMonth()+1; //(jan is 0)
        var splitInput = input.split("-");
        var inputYear = parseInt(splitInput[0], 10);
        var inputMonth = parseInt(splitInput[1], 10);
        return (thisYear < inputYear || (thisYear == inputYear && thisMonth < inputMonth) );
        
    },
	
	//Complex ones
	getRequiredWhenOtherFieldSetValidator : function(otherInputField) {
		return function(thisInputValue) {
			if (otherInputField.isNonEmpty()) {
				return (typeof thisInputValue !== "undefined" && thisInputValue);// this is the 'required' bit
			}
			return true;
		}
	},
	getRequiredWhenOtherFormEqualsValidator: function(otherInputField, value){
		return function(thisInputValue) {
			if (otherInputField.getValue() == value) {
				return (typeof thisInputValue !== "undefined" && thisInputValue);// this is the 'required' bit
			}
			return true;
		}
	},
	
	getFieldsMatchValidator : function(otherInputField) {
		return function(thisInputValue) {
			 return (otherInputField.getValue().toLowerCase() == thisInputValue.toLowerCase());
				
		}
	},
	
	getGreaterThanOtherField : function(otherInputField) {
		return function(thisInputValue) {
			return otherInputField.getValue() < thisInputValue;
		}
	}	
	
});