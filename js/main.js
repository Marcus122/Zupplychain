
//Main entry point for the website code.

require(["jquery"], function($) {
    
    init();
    
    function onPage(pagename){
        return ($(location).attr("pathname").indexOf(pagename) != -1);
    }
    
    function init(){
        
        if (onPage("search-results")){
            require(["components/search-results-map"],function(ResultsMap){
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
                    
                }
                ]
                
                var resultsMap = new ResultsMap(testData);
                
            });
        }
        
    }

});

