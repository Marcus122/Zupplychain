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
                }
                forms[id] = form;
			});
        }
        
        //TODO: would be nice if these took jquery elements rather than IDs
        function addOnSuccessCallback(id, callback) {
            forms[id].addOnSuccessCallback(callback);
        }
        
        function addOnErrorCallback(id, callback){
            forms[id].addOnErrorCallback(callback);
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
        
		instance = {
			init:init,
            addOnSuccessCallback:addOnSuccessCallback,
            addOnErrorCallback:addOnErrorCallback,
            isFormValid:isFormValid,
            rebind:rebind
		}
        return instance;
	}
	
});