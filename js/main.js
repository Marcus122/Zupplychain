
//Main entry point for the website code.

require(["jquery"], function($) {
    
    init();
    
    function onPage(pagename){
        return ($(location).attr("pathname").indexOf(pagename) != -1);
    }
    
    function init(){
        
        //fire up the loom form library.
        require(["loom/loom"], function(Loom){
            var loom = new Loom();
            loom.init();
        });
        
        if (onPage("search")){ //hacky while testing..
            require(["components/search-results-map"],function(ResultsMap){
                
                //on postcode entry, load up the map centered on that postcode.
                $("input[name='postcode']").blur(function(){
                    var resultsMap = new ResultsMap("BL0 0AT");
                    $(".js-map-results-container").show();
                });
                
                
                var testData = [
                {
                    latitude : 53.593, 
                    longitude: -2.298,
                    name: "Warehouse 1", 
                    address: "123 Bury New Road, BL1 1HG", 
                    rating: 4, 
                    imageURL : "/images/warehouse-thumb.jpg"
                },
                {
                    latitude : 53.592,
                    longitude:-2.305,
                    name:"Warehouse 2",
                    address: "88 Bolton Road, BL8 8TH", 
                    rating: 2, 
                    imageURL : "/images/warehouse-thumb2.jpg"
                    
                },
                {
                    latitude : 53.590,
                    longitude:-2.325,
                    name:"Warehouse 3",
                    address: "102 Test Road, BL8 8TH", 
                    rating: 2, 
                    imageURL : "/images/warehouse-thumb.jpg"
                    
                }
                ]
                
                var resultsMap = new ResultsMap();
                //resultsMap.load(testData);
                
            });
        }
		if (onPage("provider-registration-1") || onPage("provider-registration-2") || onPage("provider-registration-3")){
			require(["components/provider-registration"],function(Registration){
				Registration();
			});
		}
        
    }

});

