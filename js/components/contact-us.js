define(["jquery","loom/loom","loom/loomAlerts"], function ($,Loom,Alerts) {
	
    function Class() {
		var loom = new Loom;
		
		loom.addOnSuccessCallback('contact-us',function(result){
			if(result.error === true){
				Alerts.showErrorMessage(result.data);
			}else{
				Alerts.showSuccessMessage(result.data);
			}
		})
	}
	
	return Class();
});