//var search_controller = require("../controllers/search.js"),
//	local = require("../local.config.js");

var handler = function(app) {
	app.get('/find-storage', function(req,res){
		res.render("find-storage",req.data);
	});
	app.post('/find-storage', populateSearchData, function (req,res) {
		searchHandler(req,res);
	});
};
function registrationHandler(req,res){
	res.render("find-storage",req.data);
}
function populateSearchData(req,res, next){
        //Do something to get the data
        return next();
}
module.exports = handler;