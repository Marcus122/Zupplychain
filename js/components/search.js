define(["components/search-results-map", "loom/loom", "loom/loomAlerts"],function(ResultsMap, Loom, Alerts){

    

 function Class() {
    var resultsMap;
	var $postcode = $("input[name='postcode']");
	var $maxDistance = $("input[name='max-distance']");
	var loom = new Loom();
    var hasSearch = $('input[name="search-cached"]').length;
    var haveDoneASearch = false;

    var cameHereViaBackButton = (hasSearch && !(window.location.hash == "#search-area"));
    if (cameHereViaBackButton) { 
       require(["jqueryPlugins/jquery.scrollTo.min"], function(scroll) {
                    $(".search-results").show();
                    $.scrollTo(".search-results", {duration : 100, offset : -0 });
                });
                
    }
    
    $("#search-form input, #search-form select").on("change keyup",function(){
       if (haveDoneASearch) {
            $(".search-nag").fadeIn();
       }
    });
    
    $("#search-form button").click(function(){
        $(".search-nag").fadeOut();
    });
	
    //on postcode entry, load up the map centered on that postcode.
    $postcode.blur(function(){
        if ($("input[name='postcode']").val().length <=2){
            return;
        }
        resultsMap = new ResultsMap($("input[name='postcode']").val(), $("input[name='max-distance']").val(), $("input[name='postcode']"));
        $(".js-map-results-container").slideDown(); //needs to be visible for map to load successfully.
        
    });
    
    $("#register-email-popup .close").click(function() {
        $("#register-email-popup").hide();
    });
    
    $(".change-map-lock-status").click(function(){
        if( $(this).hasClass('unlock-map')){
            $(this).removeClass('unlock-map');
            $(this).addClass('lock-map');
        }else if( $(this).hasClass('lock-map')){
            $(this).removeClass('lock-map');
            $(this).addClass('unlock-map');           
        }
    });
    
    $(document).on("click", ".register-before-click", function(evt){
        evt.preventDefault();
        var requestedUrl = $(evt.target).prop("href");
        var $popup = $("#register-email-popup");
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
        $popup.find("input[name='email']").focus(); //focus the first input.
    });
    
    $('#search-results-table').on("loomSort",function(){
        var $table = $(this);
        $table.find('tbody tr').each(function(i){
           var $row = $(this);
           $row.find('td').first().text(String(Number(i) + 1) + '.'); 
        });
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
    
    $("#search-form").submit(function() {
        if (!resultsMap) {
            resultsMap = new ResultsMap($("input[name='postcode']").val(), $("input[name='max-distance']").val(), $("input[name='postcode']"));
            $(".js-map-results-container").slideDown(); //needs to be visible for map to load successfully.
        }
    });
    
    loom.addOnSuccessCallback("search-form", function(response){
        haveDoneASearch = true;
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
            if (window.location.hash == "#search-area" || hasSearch) { //if they came back via an edit search link, don't scroll down.
                (window.location.hash = "");
                hasSearch = false;
            } else if(hasSearch){
                hasSearch = false;
                (window.location.hash = "");
            } else {
                require(["jqueryPlugins/jquery.scrollTo.min"], function(scroll) { 
                    $.scrollTo("#results-area", {duration : 600, offset : -90 });
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
                   var estimatedTotalPrice = 0.0;
                   for (var j in response.results[i].storageProfile) {
                       estimatedTotalPrice += response.results[i].storageProfile[j].totalPrice;
                   }
                   response.results[i].estimatedPrice = estimatedTotalPrice ? estimatedTotalPrice.toFixed(2) :  "N/A";
                   var row = template.bind(response.results[i]);
                   $("#search-results-table tbody ").append(row);
               }
			   $(".continue-links.footer.form-footer .button.action.large.next").attr("href", response.results[0].href);
                $("#search-results-table tbody tr").first().addClass("selected");
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
	
	if (hasSearch){
		triggerSearch();
	}

    
    }

    return Class;    

            
            
});