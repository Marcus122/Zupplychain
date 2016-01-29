define(["jquery","loom/loom","loom/loomAlerts","components/global"], function ($,Loom,Alerts, Global) {
	
    function Class() {
		var loom = new Loom;
        var global = new Global;
        
        setEnquiryFromQueryParam();//Change
		
		loom.addOnSuccessCallback('contact-us',function(result){
            var options = {};
            options.centre = true;
			if(result.error === true){
				Alerts.showErrorMessage(result.data,options);
			}else{
                if(typeof ga !== 'undefined'){
                    ga('send', 'event', 'Buttons', 'Click', 'Send');//Change
                }
				Alerts.showSuccessMessage(result.data,options);
			}
		});
        
        function setEnquiryFromQueryParam(){//Change
            var enquiry = global.getQueryVariable('enquiry');
            if(enquiry){
                var value = $('select[name="your-enquiry"]').find('option').filter(function(){
                    return $(this).val() === enquiry;
                }).attr('selected','selected');
            }
        }
	}
	
	return Class();
});