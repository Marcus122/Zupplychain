define(["jquery","loom/loom","loom/loomAlerts","components/global"], function ($,Loom,Alerts, Global) {
	
    function Class() {
		var loom = new Loom;
        var global = new Global;
        
        setEnquiryFromQueryParam();//Change
		
		loom.addOnSuccessCallback('contact-us',function(result){
			if(result.error === true){
				Alerts.showErrorMessage(result.data);
			}else{
				Alerts.showSuccessMessage(result.data);
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