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
        var radius = parseInt(req.body["max-distance"],10);
        var radiusInMetres = radius * 1609.344;
        var palletType = req.body["pallet-type"];
        if (palletType === "Any") {
            palletType = "";
        }
		var weight = parseFloat(req.body.weight, 10);
		var height = parseFloat(req.body.height, 10);
        if (isNaN(weight)) {
            weight = 0; //if it's blank or there's an error, set to 0, its compared to a maxWeight value so 0 is the same as ignore in the search.
        }
        if (isNaN(height)) {
            height = 0; //ditto.
        }
        var temp = req.body.temperature;
		var qty = req.body.quantity;
        var query = {"postcode" : postcode, "radius" : radius, "palletType" : palletType, "weight" : weight, "height" : height, "temp" : temp, "totalPallets" : qty, "radiusInMetres" : radiusInMetres};
		
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
	'{"palletType":"'+palletType +'","totalPallets":"'+qty+'","postcode":"'+postcode+
	'","maxDistance":"'+radius+'","description":"'+req.body.description+
	'","height":"'+height+'","weight":"'+weight+'","temp":"'+temp+'","startDate":"'+
	req.body["start-date"]+'","endDate":"'+req.body["end-date"]+'"} ]}';
	
	return JSON.parse(srchJson)
}
module.exports = handler;