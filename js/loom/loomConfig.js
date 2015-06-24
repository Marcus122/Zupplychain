define(["jquery"],function($){
    
    //Leave options you don't use commented out so they can be activated later as required.
    //All values have sensible defaults, having no values in here won't break loom.
    //This file should be self documenting, please leave the descriptive comments in place.
    //Values shown for options are the defaults.
   return {
        "FORM_PENDING_CLASS"  :  "form-pending",           // Class added to a form while it is awaiting validation / server response.
		
        "FORM_ERROR_CLASS"    :  "form-error",           // Class added to a form where the form post experiences an error.
		
        "FORM_SUCCESS_CLASS"  :  "form-success",          //Class added to a form where the form post is successful.
        
        "FORM_FIELD_CONTAINER_SELECTOR" : ".input-field",  // CSS selector for the container (usually a div) used to wrap form fields. Loom uses this class to select what to look inside for inputs on a loom form.
        
        "VALIDATION_ELEMENT_SELECTOR" : ".input-field", //The surrounding element of an input field that has the validation classes applied to it. a closest() selector is used on the input using this selector is used to select this element.
		
        "VALIDATE_ON_BLUR" : false, // Whether form inputs trigger validation only on blur.
		
        "MAY_NOT_PROGRESS_PAST_INVALID_FIELD" : false, //Does not allow the user to tab past a field while it is invalid... use with care!
		
        "REALTIME_VALIDATION" : true, // Validation fires on the onclick, onchange and onblur.
		
        "JUMP_TO_INVALID_FIELD_ON_SUBMIT" : true, //When trying to submit a form that is invalid, the first invalid field is focussed.
        
        "USE_LOOM_RESPONSE_HANDLER_BY_DEFAULT" : false
    } 
});
