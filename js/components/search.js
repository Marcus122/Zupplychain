define(["components/search-results-map", "loom/loom"],function(ResultsMap, Loom){

    

 function Class() {
    var resultsMap;
    //on postcode entry, load up the map centered on that postcode.
    
    $("input[name='postcode']").blur(function(){
        resultsMap = new ResultsMap($("input[name='postcode']").val(), $("select[name='max-distance']").val());
        $(".js-map-results-container").slideDown(); //needs to be visible for map to load successfully.
        $(".js-page-banner").slideUp(300,function(){$(".search-top-section").css("height", "auto");
         require(["jqueryPlugins/jquery.scrollTo.min"], function(scroll) {
             
            $.scrollTo("#search-area",{ duration: 200, offset : -200});
         });
        });
        
    });
    
    $("select[name='max-distance']").change(function(){
        if (resultsMap) {
            resultsMap.setRadius($("select[name='max-distance']").val());
        }
    });
    
    var loom = new Loom();
    loom.addOnSuccessCallback("search-form", function(response){
        var res = resultsMap.load(response.results);
        if (res) {
            $(".search-result-info-box").fadeIn();
            require(["jqueryPlugins/jquery.scrollTo.min"], function(scroll) { 
                $.scrollTo("#results-area", {duration : 600, offset : -150 });
            });
        } else {
            alert("no results found for your search");
        }
    });
    loom.addOnErrorCallback("search-form", function(response){
        alert("posted and got error result");
    });
    
    
    }

    return Class;    

            
            
});