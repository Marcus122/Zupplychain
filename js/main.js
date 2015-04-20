
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
        
        if (onPage("search")){ //hacky while testing.. TODO: Move this lot to its own Search component.
            require(["components/search"], function(Search) {
               Search();
            });
        }
		if (onPage("provider-registration-1") || onPage("provider-registration-2") || onPage("provider-registration-3")){
			require(["components/provider-registration"],function(Registration){
				Registration();
			});
		}
        
    }

});

