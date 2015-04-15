//var search_controller = require("../controllers/search.js"),
//	local = require("../local.config.js");


// GET /search returns the combined search /results form
// POST /search returns the json for the results.

var handler = function(app) {
	app.get('/find-storage', function(req,res){
		res.render("find-storage",req.data);
	});
	
    app.post('/search', populateSearchData, function (req,res) {
		searchHandler(req,res);
	});
    
    app.get('/search', function (req,res) {
		res.render("find-storage",req.data);
	});
};

function searchHandler(req,res){
    //req.data will store the data from populate searchData
    var testData = { results :[
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
    ]};
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(testData));
}
function populateSearchData(req,res, next){
        //Do something to get the data
        return next();
}
module.exports = handler;