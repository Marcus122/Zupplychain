
//Main entry point for the website code.

require(["jquery","components/global","jqueryPlugins/jquery.scrollTo.min","loom/loomAlerts"], function($,Global,Scroll,Alert) {
    
    init();
    
    function onPage(pagename){
        return ($(location).attr("pathname").indexOf(pagename) != -1);
    }
    
    function init(){
        var global = new Global();
        
        $(document).ajaxSend(function() {
		  $("body").addClass("wait");
          global.disableButtonsOnAjax();
		});
		 $(document).ajaxStop(function() {
		  $("body").removeClass("wait");
          global.enableButtonsOnAjaxCompletion();
		});
        //fire up the loom form library.
        require(["loom/loom"], function(Loom){
            var loom = new Loom({
                onError:handleError
            });
        });
        
        function handleError(response){
            if(response.xhr && response.xhr.status === 403){
                global.show403Popup();
            }else{
                var message = response.data.message || response.data;
                Alert.showPersistentErrorMessage(message);
            }
        }
        
        if (onPage("search")){
            require(["components/search"], function(Search) {
               Search();
            });   
        }
        if (onPage("contact-us")){
            require(["components/contact-us"], function(ContactUs) {
               //ContactUs();
            });   
        }
		if (onPage("provider-registration-1") || onPage("provider-registration-2") || onPage("provider-registration-3") || onPage("initial-registration") || onPage("dashboard")){
			require(["components/provider-registration"],function(Registration){
				Registration();
			});
		}
        if (onPage("login") || onPage("dashboard") || onPage("contacts-setup") || onPage("contacts-explanation")){
            require(["components/dashboard"], function(Dashboard) {
               Dashboard();
            });   
        }
        if (onPage("warehouse-profile") || onPage("quotation-request") || onPage("/provider-offer") || onPage("provider-confirm-contract")) {
            require(["components/warehouse-profile"], function(warehouseProfile){
                warehouseProfile();
            });
        }
        if(onPage("about-us")){
             require(["components/static"], function(Static){
                Static();
            });
        }
        
	}
    
    function handleLoomValidationError($element){
        $.scrollTo($element); 
    }
	
});

