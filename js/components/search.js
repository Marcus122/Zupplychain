define(["components/search-results-map", "loom/loom"],function(ResultsMap, Loom){

    

 function Class() {
    var resultsMap;
    //on postcode entry, load up the map centered on that postcode.
    
    $("input[name='postcode']").blur(function(){
        resultsMap = new ResultsMap($("input[name='postcode']").val(), $("select[name='max-distance']").val());
        $(".js-map-results-container").show(); //needs to be visible for map to load successfully.
        $(".js-page-banner").slideUp(600,function(){$(".search-top-section").css("height", "auto");
            
        });
        
    });
    
    $("select[name='max-distance']").change(function(){
        if (resultsMap) {
            resultsMap.setRadius($("select[name='max-distance']").val());
        }
    });
    
    var loom = new Loom();
    loom.addOnSuccessCallback("search-form", function(response){
        resultsMap.load(response.results);
        $(".search-result-info-box").fadeIn();
        require(["jqueryPlugins/jquery.scrollTo.min"], function(scroll) { 
            $.scrollTo("body", {duration : 600 });
        });
    });
    loom.addOnErrorCallback("search-form", function(response){
        alert("posted and got error result");
    });
    
    
    }

    return Class;    

            
            
});