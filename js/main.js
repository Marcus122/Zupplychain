
//Main entry point for the website code.

require(["jquery"], function($) {
    
    init();
    
    function onPage(pagename){
        return ($(location).attr("pathname").indexOf(pagename) != -1);
    }
    
    function init(){
        
        if (onPage("search-results")){
            //require the page specific module for example;
        }
        
    }

});

