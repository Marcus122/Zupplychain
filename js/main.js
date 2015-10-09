
//Main entry point for the website code.

require(["jquery"], function($) {
    
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
            var loom = new Loom();
        });
        
        if (onPage("search")){
            require(["components/search"], function(Search) {
               Search();
            });   
        }
        if (onPage("login") || onPage("dashboard")){
            require(["components/dashboard"], function(Dashboard) {
               Dashboard();
            });   
        }
        if (onPage("contact-us")){
            require(["components/contact-us"], function(ContactUs) {
               //ContactUs();
            });   
        }
		if (onPage("provider-registration-1") || onPage("provider-registration-2") || onPage("provider-registration-3")){
			require(["components/provider-registration"],function(Registration){
				Registration();
			});
		}
        if (onPage("warehouse-profile") || onPage("quotation-request") || onPage("/provider-offer") || onPage("provider-confirm-contract")) {
            require(["components/warehouse-profile"], function(warehouseProfile){
                warehouseProfile();
            });
        }
        
        $(document).on('click','input[type="date"]',function (){
            $(this).datepicker().show();
        });
        
        $(document).on('click', '.toggle-view-edit',function(){
            var $this = $(this);
            if (!$this.hasClass('down')){
                $this.toggleClass("down");
                $this.siblings('.toggle-view-edit').removeClass("down");
            }
        });
        
	}
	
});

