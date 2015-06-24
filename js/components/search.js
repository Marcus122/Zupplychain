define(["components/search-results-map", "loom/loom", "loom/loomAlerts"],function(ResultsMap, Loom, Alerts){

    

 function Class() {
    var resultsMap;
	var $postcode = $("input[name='postcode']");
	var $maxDistance = $("input[name='max-distance']");
	var loom = new Loom();
	
    //on postcode entry, load up the map centered on that postcode.
    $postcode.blur(function(){
        if ($("input[name='postcode']").val().length <=2){
            return;
        }
        resultsMap = new ResultsMap($("input[name='postcode']").val(), $("input[name='max-distance']").val());
        $(".js-map-results-container").slideDown(); //needs to be visible for map to load successfully.
        $(".js-page-banner").slideUp(300,function(){$(".search-top-section").css("height", "auto");
             require(["jqueryPlugins/jquery.scrollTo.min"], function(scroll) {
                //$.scrollTo("#search-area",{ duration: 200, offset : -200});
             });
        });
        
    });
    
    
    $("#register-email-popup .close").click(function() {
        $("#register-email-popup").hide();
    });
    
    $(document).on("click", ".register-before-click", function(evt){
        evt.preventDefault();
        var requestedUrl = $(evt.target).prop("href");
        var $popup = $("#register-email-popup");
        $popup.find("input[name='email']").focus(); //focus the first input.
        //bind up an onsuccess for the popup form that redirects to requested url once they've registered.
        loom.addOnSuccessCallback("#register-email-form", function(response){
            window.location.href = requestedUrl;
        });
        loom.addOnErrorCallback("#register-email-form", function(response){
            Alerts.showErrorMessage("There was an error storing your details");
            window.location.href = requestedUrl;
        });
        //show the popup.
        $popup.show();
    });
    
    $maxDistance.change(function(){
        if (resultsMap) {
            resultsMap.setRadius($("input[name='max-distance']").val());
        }
    });
	
	function triggerSearch(){
		$postcode.trigger("blur")
		$maxDistance.trigger("change");
		$("#search-form").submit();
	}
    
    
    
    loom.addOnSuccessCallback("search-form", function(response){
		var $searchResInfoBox = $(".search-result-info-box");
        var res = resultsMap.load(response.results);
        if (res) {
            $searchResInfoBox.fadeIn();
            $(".continue-links").fadeIn();
            $(".search-results").fadeIn();
            $(".info-boxes").fadeOut();
            $(".testimonials").fadeOut();
            if (response.results.length === 1){
				$searchResInfoBox.find('.controls').hide();
			} else {
                $searchResInfoBox.find('.controls').show()
            }
            if (window.location.hash == "#search-area") { //if they came back via an edit search link, don't scroll down.
                (window.location.hash = "");
            } else {
                require(["jqueryPlugins/jquery.scrollTo.min"], function(scroll) { 
                    $.scrollTo("#results-area", {duration : 600, offset : -150 });
                });
            }
            var numResults = response.results.length;
            var resultsWord = numResults != 1 ? " results loaded" : " result loaded";
            Alerts.showSuccessMessage(response.results.length + resultsWord);
            require(["templates/templates"], function(Templates){
               var templates = new Templates();
               var template = templates.getTemplate("result-table-row");
               var lim=response.results.length;
			   $("#search-results-table tbody tr").remove();
               for (var i =0 ;i< lim;i++) {
                   response.results[i].num = i + 1;
                   response.results[i].href = '/warehouse-profile/' + response.results[i]._id + '?fromSearch=true';
                   var row = template.bind(response.results[i]);
                   $("#search-results-table tbody ").append(row);
               }
			   $(".continue-links.footer.form-footer .button.action.large.next").attr("href", response.results[0].href);
            });
            
            require(["loomTable/Table"], function(loomTable) {
                var LoomTable = new loomTable($('#search-results-table'), {
                    fields : {
                        'rating' : {
                            getValue:function($td) {
                                return parseInt($td.data("rating"), 10);
                            }
                        }
                    } 
                });
            });
            
        } else {
            Alerts.showErrorMessage("No results found for your search");
        }
    });
    
    loom.addOnErrorCallback("search-form", function(response){
        Alerts.showPersistentErrorMessage("There was an error completing your search");
    });
	
	if ($('input[name="search-cached"]').length){
		triggerSearch();
	}
    
    }

    return Class;    

            
            
});