var searchController= require("../controllers/search.js");


//?	local = require("../local.config.js");


// GET /search returns the combined search & results form
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
    var resultsData = req.data.results;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(resultsData));
}
function populateSearchData(req,res, next){
        var postcode = req.body.postcode;
        var radius = req.body.distance;
        var palletType = req.body["pallet-type"];
        
        var query = {"postcode" : postcode, "radius" : radius, "palletType" : palletType};
        searchController.search_storage(query, function(error, results) {
            if (error) {
                req.data.error = error;
            }
            req.data.results = results; next(); 
        });
}
module.exports = handler;