define(["jquery", "./form"],function($, Form){
	
    //singleton.
    var instance;
    
	return function Class($config) {
        if (instance) {
            return instance;
        }
        
		var forms={};
        var settings = $.extend({
            option:'default-value'
        }, $config)
				
		
        // Config ignored at the moment.
		var defaultConfig = {
			validateOnBlur : false,
			realtimeValidation : true
		}
		
		function init() {
			//intentionally left for backwards compatability with an older version.
		}
        
        init2();
        
        function init2() {
            var formElements = $("form.loom-form");
            var count = 0;
			formElements.each(function(){
				form = new Form(this);
                var id = $(this).attr('id');
                if (!id) {
                    id = count++; //if there is no id we fall back to an integer index.
                    console.log("loom.js WARNING: forms without ID's can cause issues with internal indexing in loom, consider adding ID's to all your forms.")
                }
                forms[id] = form;
                this.loomForm = form; //store the loomForm alongside the dom instance.
			});
        }
        
        //TODO: would be nice if these took jquery elements rather than IDs
        function addOnSuccessCallback(id, callback) {
            var thisForm = getForm(id);
            if (thisForm){
                thisForm.addOnSuccessCallback(callback);
            }
        }
        
        function addOnErrorCallback(id, callback){
            var thisForm = getForm(id);
            if (thisForm){
                thisForm.addOnErrorCallback(callback);
            }
        }
        
        function rebind(elements) {
            var lim = elements.length;
            for (var i =0;i< lim;i++) {
                var thisID = $(elements[i]).attr("id");
                forms[thisID] = new Form($(elements[i]));
            }
        }
        
        function isFormValid(formID) {
            var form = forms[formID];
            if (!form || form.length < 1) {
                return false;
            } else {
                return form.validateFormAndReturnTrueIfValid();
            }
        }
        
        //takes a jquery form element, or an ID, and returns the loomForm instance associated with that form (if one exists).
        function getForm(formOrId) {
            if (typeof formOrId == 'string') {
                if (formOrId in forms) {
                    return forms[formOrId];
                }
                return false;
            } else {
                if (formOrId.length >= 1) { //we're assuming its a jquery object
                    var elem = formOrId[0];
                    if (elem.loomForm) { //when we initiated, we should have stored the loomForm instance on a property.
                        return elem.loomForm;
                    }
                }
            }
        }
        
        //submits the form through loom (e.g. only actually gets submitted if valid);
        function trySubmitForm(formOrId) {
            var thisForm = getForm(formOrId);
            if (!thisForm) {
                return false;
            }
            thisForm.onSubmit();
        }
        
        
		instance = {
			init:init,
            addOnSuccessCallback:addOnSuccessCallback,
            addOnErrorCallback:addOnErrorCallback,
            isFormValid:isFormValid,
            rebind:rebind,
            getForm:getForm,
            trySubmitForm:trySubmitForm
		}
        return instance;
	}
	
});