"use strict";
var searchController= require("../controllers/search.js");
var warehouseController= require("../controllers/warehouses.js");

var local = require("../local.config.js");
var Utils = require("../utils.js");


// GET /search returns the combined search & results page
// POST /search returns the json for the results.

var handler = function(app) {
	
    app.post('/search', saveSearchAndDoSearch, function (req,res) {
		searchHandler(req,res);
	});
    
    app.get('/search', function (req,res) {
        req.data.minDurationOptions = local.config.minDurationOptions;
        req.data.palletTypes = local.config.palletTypes;
        req.data.temperatures = local.config.temperatures;
		res.render("search",req.data);
	});
    
    app.post('/useage-profile', updateUseageProfileAndLoadWarehouse, function(req, res) {
        // return some data once we've updated everything.
       	res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(req.data.warehouse.storageProfile) + "\n");
    });

};

function searchHandler(req,res){
    var resultsData = req.data.results;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(resultsData));
}

function isNewSearchCompatableWithSessionSearch(newSearch, sessionSearch) {
    return (
      newSearch.totalPallets == sessionSearch.totalPallets &&
      newSearch.minDuration == sessionSearch.minDuration
    )
}

function saveSearchAndDoSearch(req,res, next){
    var query = getQueryFromRequest(req); //this has a new blank useage profile.. we need to check if we need to preserve the old one..
    
    searchController.getFromSession(req, function(err, sessionQuery) {
        if (!err && sessionQuery && sessionQuery.useageProfile) { //does an existing query exist in the session with a useageprofile attached?
            if  (isNewSearchCompatableWithSessionSearch(query, sessionQuery) ) { //compare the session search to the new one. if all the important values are the same then we should preserve the existing useage profile. If numPallets etc. have changed then it makes sense to use a blank useage profile.
                query.useageProfile = sessionQuery.useageProfile;
            }  
        }       
        saveSearch(query, req);
        doSearch(query, req, res, next); 
        
    });
        //do we have a useage profile saved? if so then...
    
            //don't overwrite with a new blank useage profile, keep the existing one.
    
}

function saveSearch(query,req) {
    searchController.saveSearch(query, function(err, search) {
            if (err) {
                console.log("failed to save search");
                console.log(err);
            } else {
                if (!query.id) { //was getting a weird bug where id was coming back undefined.
                    query._id = search._id;
                }
                searchController.saveToSession(query,req);
            }
        });
    
    
    /*searchController.getFromSession(req, function(err, searchFromSession){
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
    });   */
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

function updateUseageProfileAndLoadWarehouse(req,res, next) {
    searchController.getFromSession(req, function(err, sessionQuery) {
        console.log("loaded search from session to update, id is: ");
        console.log(sessionQuery._id);
        if(err) {
            next();
            return;
        }
        var currentUseageProfile = sessionQuery.useageProfile;
        var warehouseId = req.body["warehouse-id"];
        var newUseageProfile = getUseageProfileFromRequest(req);
        var indexOfRowThatChanged = 0;
        var newValueOfRowThatChanged = 0;
        for (var i in newUseageProfile) {
            indexOfRowThatChanged = i;//for now we can only change one row at a time so we only need to store one index.
            newValueOfRowThatChanged = newUseageProfile[i];
            if (i in currentUseageProfile) {
                currentUseageProfile[i] = newUseageProfile[i];
            }
        }
        
        
        var weekNo = 0;
        //we look at the row that changed, and cascade that volume down to lower rows... this is a UI requirement.
        for ( var k in currentUseageProfile) {
            if (weekNo == 0) { //while we're here, we grab the first week pallet useage if it changed and update the search criteria totalPallets with this value.
                if (indexOfRowThatChanged == k) {
                    sessionQuery.totalPallets = newUseageProfile[k];
                }
            }
            if (new Date(k) > new Date(i)) {
                currentUseageProfile[k] = newValueOfRowThatChanged;
            }
            weekNo++;
        }
        sessionQuery.useageProfile = currentUseageProfile;
        warehouseController.getById(warehouseId, function(err, warehouse){
            warehouse.generateStorageProfile(sessionQuery);
            console.log("doing final session save in update usesage, id is: " + sessionQuery._id);
            saveSearch(sessionQuery, req);
            req.data.warehouse = warehouse;
            next();
        }); 
    });
}

function getUseageProfileFromRequest(req) {
    var wcDate = new Date(req.body["wcDate"]);
    var newValue = parseInt(req.body["numPallets"]);
    var entry = {}
    entry[wcDate.toISOString().substr(0,10)] = newValue;
    return entry;
}

function getQueryFromRequest(req) {
        

        var radius          = parseInt(req.body["max-distance"],10);
        var radiusInMetres  = radius * 1609.344;
        var minDuration     = parseInt(req.body.minDuration,10);
		var weight          = parseFloat(req.body.weight, 10);
		var height          = parseFloat(req.body.height, 10);
        var startDate       = new Date(req.body["start-date"]);
        weight              = isNaN(weight) ? 0 : weight;
        height              = isNaN(height) ? 0 : height;
        var totalPallets    = parseInt(req.body["quantity"],10);
        
        var effectiveStartDate = Utils.getClosestPreviousMonday(startDate) 
        var useageProfile = searchController.generateBlankUseageProfile(effectiveStartDate, minDuration, totalPallets);
        
        var query = {
            "postcode"          : req.body.postcode,
            "radius"            : radius,
            "palletType"        : req.body["pallet-type"],
            "weight"            : weight,
            "height"            : height, 
            "temp"              : req.body.temperature, 
            "totalPallets"      : totalPallets, 
            "radiusInMetres"    : radiusInMetres, 
            "minDuration"       : minDuration, 
            "startDate"         : startDate, 
            "description"       : req.body.description, 
            "maxDistance"       : radius, 
            "useageProfile"     : useageProfile
        };
        return query;
}

module.exports = handler;