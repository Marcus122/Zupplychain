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
        var radius = req.body["max-distance"];
        var palletType = req.body["pallet-type"];
		var weight = req.body.weight;
		var height = req.body.height
		var temp = req.body.temperature;
		var qty = req.body.quantity;
        var query = {"postcode" : postcode, "radius" : radius, "palletType" : palletType, "weight" : weight, "height" : height, "temp" : temp, "totalPallets" : qty };
		
		req.session.whSC = populateSessionStateJSON(req,postcode,palletType,radius,weight,height,temp,qty);
		
        searchController.search_storage(query, function(error, results) {
            if (error) {
                req.data.error = error;
            }
            req.data.results = results; next(); 
        });
}
function populateSessionStateJSON(req,postcode,palletType,radius,weight,height,temp,qty){
	var srchJson = '{"sc":[' +
	'{"palletType":"'+palletType +'","searchQty":"'+qty+'","postcode":"'+postcode+
	'","maxDistance":"'+radius+'","description":"'+req.body.description+
	'","height":"'+height+'","weight":"'+weight+'","temp":"'+temp+'","startDate":"'+
	req.body["start-date"]+'","endDate":"'+req.body["end-date"]+'"} ]}';
	
	return JSON.parse(srchJson)
}
module.exports = handler;