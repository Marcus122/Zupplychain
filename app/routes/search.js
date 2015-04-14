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
		searchHandler(req,res);
	});
};

function searchHandler(req,res){
	res.render("find-storage",req.data);
}
function populateSearchData(req,res, next){
        //Do something to get the data
        return next();
}
module.exports = handler;