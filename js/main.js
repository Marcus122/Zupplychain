
//Main entry point for the website code.

require(["jquery","components/global","jqueryPlugins/jquery.scrollTo.min","loom/loomAlerts"], function($,Global,Scroll,Alert) {
    
    init();
    
    function onPage(pagename){
        return ($(location).attr("pathname").indexOf(pagename) != -1);
    }
    
    function init(){
        $(document).ajaxSend(function() {
		  $("body").addClass("wait");
		});
		 $(document).ajaxStop(function() {
		  $("body").removeClass("wait");
		});
        //fire up the loom form library.
        require(["loom/loom"], function(Loom){
            var loom = new Loom({
                onError:handleError
            });
        });
        
        function handleError(response){
            if(response.xhr && response.xhr.status === 403){
                var global = new Global();
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
        if (onPage("login") || onPage("dashboard") || onPage("contacts-setup")){
            require(["components/dashboard"], function(Dashboard) {
               Dashboard();
            });   
        }
        if (onPage("contact-us")){
            require(["components/contact-us"], function(ContactUs) {
               //ContactUs();
            });   
        }
		if (onPage("provider-registration-1") || onPage("provider-registration-2") || onPage("provider-registration-3") || onPage("initial-registration")){
			require(["components/provider-registration"],function(Registration){
				Registration();
			});
		}
        if (onPage("warehouse-profile") || onPage("quotation-request") || onPage("/provider-offer") || onPage("provider-confirm-contract")) {
            require(["components/warehouse-profile"], function(warehouseProfile){
                warehouseProfile();
            });
        }
        
	}
    
    function handleLoomValidationError($element){
        $.scrollTo($element); 
    }
	
});

