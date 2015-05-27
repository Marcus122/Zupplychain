define(["components/search-results-map", "loom/loom", "loom/loomAlerts"],function(ResultsMap, Loom, Alerts){

    

 function Class() {
    var resultsMap;
    //on postcode entry, load up the map centered on that postcode.
    
    $("input[name='postcode']").blur(function(){
        if ($("input[name='postcode']").val().length <=4){
            return;
        }
        resultsMap = new ResultsMap($("input[name='postcode']").val(), $("input[name='max-distance']").val());
        $(".js-map-results-container").slideDown(); //needs to be visible for map to load successfully.
        $(".js-page-banner").slideUp(300,function(){$(".search-top-section").css("height", "auto");
         require(["jqueryPlugins/jquery.scrollTo.min"], function(scroll) {
            $.scrollTo("#search-area",{ duration: 200, offset : -200});
         });
        });
        
    });
    
    $("input[name='max-distance']").change(function(){
        if (resultsMap) {
            resultsMap.setRadius($("input[name='max-distance']").val());
        }
    });
    
    $(document).on("click", "button.add-to-quote", function(evt){
        $button = $(evt.target);
        id = $button.data("id");
        $('#' + id).find('input').prop("checked",true);
        $button.hide();
        $button.parent().find(".remove-from-quote").show();
    });
    
    $(document).on("click", "button.remove-from-quote", function(evt){
        $button = $(evt.target);
        id = $button.data("id");
        $('#' + id).find('input').prop("checked", false);
        $button.hide();
        $button.parent().find(".add-to-quote").show();
    });
    
    $(document).on("change", "#search-results-table input", function(evt){
        var check = $(evt.target).is(":checked");
        var id = $(evt.target).closest("tr").attr("id");
        debugger;
        if (check){
            var test = ".remove-from-quote[data-id='" + id + "']";
            $(".remove-from-quote[data-id='" + id + "']").show();
            $(".add-to-quote[data-id='" + id + "']").hide();
        } else {
            $(".remove-from-quote[data-id='" + id + "']").hide();
            $(".add-to-quote[data-id='" + id + "']").show();
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
            Alerts.showSuccessMessage("results loaded");
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
            Alerts.showErrorMessage("No results found for your search");
        }
    });
    
    loom.addOnErrorCallback("search-form", function(response){
        Alerts.showPersistentErrorMessage("There was an error completing your search");
    });
    
    }

    return Class;    

            
            
});