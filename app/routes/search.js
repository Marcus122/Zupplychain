var searchController= require("../controllers/search.js");
var warehouseController= require("../controllers/warehouses.js");

local = require("../local.config.js");


// GET /search returns the combined search & results form
// POST /search returns the json for the results.

var handler = function(app) {
	
    app.post('/search', saveSearchAndDoSearch, function (req,res) {
		searchHandler(req,res);
	});
    
    app.get('/search', function (req,res) {
        req.data.minDurationOptions = local.config.minDurationOptions;
        req.data.palletTypes = local.config.palletTypes;
        req.data.temperatures = local.config.temperatures;
		res.render("find-storage",req.data);
	});
    
    app.post('/useage-profile', updateUseageProfile, function(req, res) {
        // return some data once we've updated everything.
       	res.writeHead(200, {"Content-Type": "application/json"});
        var output = { error: null, data: "success" }
        res.end(JSON.stringify(req.data.warehouse.storageProfile) + "\n");
    });
};

function updateUseageProfile(req,res, next) {
    searchController.getFromSession(req, function(err, sessionQuery) {
        if(err) {
            next();
            return;
        }
        var currentUseageProfile = sessionQuery.useageProfile;
        var warehouseId = req.body["warehouse-id"];
        var newUseageProfile = getUseageProfileFromRequest(req);
        for (var i in newUseageProfile) {
            if (i in currentUseageProfile) {
                currentUseageProfile[i] = newUseageProfile[i];
            }
        }
        var highestSeenPalletUse = 0;
        for ( var k in currentUseageProfile) {
            highestSeenPalletUse = Math.max(highestSeenPalletUse, currentUseageProfile[k]);
        }
        sessionQuery.totalPallets = highestSeenPalletUse;
        saveSearch(sessionQuery, req);
        //look into loading the wareouse and using warehouse.generateStorageProfile();
        warehouseController.getById(warehouseId, function(err, warehouse){
            warehouse.generateStorageProfile(sessionQuery);
            req.data.warehouse = warehouse;
            next();
        }); 
    });
}

function searchHandler(req,res){
    var resultsData = req.data.results;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(resultsData));
}

function saveSearchAndDoSearch(req,res, next){
        var query = getQueryFromRequest(req);
        saveSearch(query, req);
        doSearch(query, req, res, next);
}

function getUseageProfileFromRequest(req) {
    var wcDate = new Date(req.body["wcDate"]);
    var newValue = parseInt(req.body["numPallets"]);
    var entry = {}
    entry[wcDate.toISOString().substr(0,10)] = newValue;
    return entry;
}

function getQueryFromRequest(req) {
 
        function addDays(date, days) {
            date.setDate(date.getDate() + days);
        }
    
        //this stuff should be in a controller somewhere maybe?
        var postcode = req.body.postcode;
        var radius = parseInt(req.body["max-distance"],10);
        var radiusInMetres = radius * 1609.344;
        var palletType = req.body["pallet-type"];
        if (palletType === "Any") {
            palletType = ""; //This is to be removed after the demo, Any should match "Any" just like any other pallet type
        }
        var minDuration = parseInt(req.body.minDuration,10);
		var weight = parseFloat(req.body.weight, 10);
		var height = parseFloat(req.body.height, 10);
        var startDate = new Date(req.body["start-date"]);
        if (isNaN(weight)) {
            weight = 0; //if it's blank or there's an error, set to 0, its compared to a maxWeight value so 0 is the same as ignore in the search.
        }
        if (isNaN(height)) {
            height = 0; //ditto.
        }
        var temp = req.body.temperature;
		var qty = req.body.quantity;
        //for now assume 100% useage at all dates.
        var dayOfWeek = startDate.getDay();
        var effectiveStartDate = new Date(startDate.getTime());
        //for now just pull the start day to the closest monday.
        if (dayOfWeek > 1) {
            addDays(effectiveStartDate, -(dayOfWeek-1));
        } else if (dayOfWeek == 0) {
            addDays(effectiveStartDate, -6);
        }
        //by default we just create a useage profile at 100%;
        var dateKey = startDate.toISOString().substr(0,10);
        var useageProfile = {}
        useageProfile[dateKey] = qty;
        
        var startDateCopy = new Date(startDate.toISOString());
        for (var i = 1; i < minDuration; i++) {
            addDays(startDateCopy,7);
            var key = startDateCopy.toISOString().substr(0,10);
            useageProfile[key] = qty;
        }
        
        var query = {"postcode" : postcode, "radius" : radius, "palletType" : palletType, "weight" : weight, "height" : height, "temp" : temp, "totalPallets" : qty, "radiusInMetres" : radiusInMetres, "minDuration" : minDuration, "startDate" : startDate, "description" : req.body.description, "maxDistance" : radius, "useageProfile" : useageProfile};
        return query;
}

function saveSearch(query,req) {
        searchController.getFromSession(req, function(err, searchFromSession){
            if (!err && searchFromSession && searchFromSession._id) {
                    query._id = searchFromSession._id;
            }
            searchController.saveSearch(query, function(err, search) {
                if (err) {
                    console.log(err);
                } else {
                    query._id = search._id;
                    searchController.saveToSession(query,req);
                }
            });
        });
        
}

function doSearch(query,req,res,next) {
        searchController.search_storage(query, function(error, results) {
            if (error) {
                req.data.error = error;
            }
            req.data.results = results;
            next(); 
        });
}



module.exports = handler;