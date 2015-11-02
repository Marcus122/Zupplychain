define(["jquery", "./form"],function($, Form){
	
    //singleton.
    var instance;
    
	return function Class(_config) {
        if (instance) {
            return instance;
        }
        
        var config;
        
        require(["loom/loomConfig"], function(Config){
            config = Config;
        }, 
        function(err) {
            throw("Error : Could not require loom/loomConfig.. this version of loom requires a config file.");
            
        });
        var _config = _config;
        
		var forms={};	
		
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
                if(_config.onError){
                    form.addOnErrorCallback(_config.onError);
                }
                forms[id] = form;
                this.loomForm = form; //store the loomForm alongside the dom instance.
			});
        }
        
        function addOnInvalidCallback(id,callback) {
            var thisForm = getForm(id);
            if(thisForm){
                ;//TODO
            }
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
        
        function addOnSoftErrorCallback(id, callback){
            var thisForm = getForm(id);
            if (thisForm){
                thisForm.addOnSoftErrorCallback(callback);
            }
        }
        
        function addOnHardErrorCallback(id, callback){
            var thisForm = getForm(id);
            if (thisForm){
                thisForm.addOnHardErrorCallback(callback);
            }
        }
        
        
        function clearValidationStylesOnAllForms() {
            for (var i in forms) {
                forms[i].clearAllValidationStyles();
            }
        }
        
        function reset(id, callback){
            var thisForm = getForm(id);
            if (thisForm) {
                thisForm.reset();
            }
        }
        
        function rebind(elementsOrId) {
            if (typeof elementsOrId == "string") {
                    form = getForm(elementsOrId);
                    formId = elementsOrId.replace(/#/g, '');
                    forms[elementsOrId] = new Form($('#' + elementsOrId));
                    return;
            } 
            var lim = elementsOrId.length;
            for (var i =0;i< lim;i++) {
                var thisID = $(elementsOrId[i]).attr("id");
                forms[thisID] = new Form($(elementsOrId[i]));
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
        
        /*function isFieldSetValid(formId, fieldSetId) {
            var form = forms[formID];
            if (!form || form.length < 1) {
                return false;
            } else {
                return form.validateFormAndReturnTrueIfValid();
            }
        }*/
        
        //takes a jquery form element, or an ID, and returns the loomForm instance associated with that form (if one exists).
        function getForm(formOrId) {
            if (typeof formOrId == 'string') {
                var lookupId = formOrId;
                if (formOrId.indexOf("#") == 0) { //strip leading '#' from jquery style id's
                    lookupId = formOrId.substring(1,formOrId.length);
                }
                
                if (lookupId in forms) {
                    return forms[lookupId];
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
            addOnSoftErrorCallback:addOnSoftErrorCallback,
            addOnHardErrorCallback:addOnHardErrorCallback,
            isFormValid:isFormValid,
            rebind:rebind,
            getForm:getForm,
            trySubmitForm:trySubmitForm,
            reset:reset,
            clearValidationStylesOnAllForms:clearValidationStylesOnAllForms
		}
        return instance;
	}
	
});