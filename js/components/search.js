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
            $(".continue-links").fadeIn();
            $(".search-results").fadeIn();
            $(".info-boxes").fadeOut();
            $(".testimonials").fadeOut();
            
            require(["jqueryPlugins/jquery.scrollTo.min"], function(scroll) { 
                $.scrollTo("#results-area", {duration : 600, offset : -150 });
            });
            require(["templates/templates"], function(Templates){
               var templates = new Templates();
               var template = templates.getTemplate("result-table-row");
               var lim=response.results.length;
               for (var i =0 ;i< lim;i++) {
                   response.results[i].num = i + 1;
                   response.results[i].href = '/warehouse-profile/' + response.results[i]._id;
                   var row = template.bind(response.results[i]);
                   $("#search-results-table tbody ").append(row);
               }
            });
            
            
        } else {
            alert("no results found for your search");
        }
    });
    loom.addOnErrorCallback("search-form", function(response){
        alert("There was an error completing your search");
    });
    
    }

    return Class;    

            
            
});