"use strict";
var searchController= require("../controllers/search.js");
var warehouseController= require("../controllers/warehouses.js");
var userWh = require("../controllers/user-warehouses.js");
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
        req.data.page = 'search';
        if (req.session.firstSearch === undefined){
            req.session.firstSearch = "true";
        }else{
            req.session.firstSearch = "false";
        }
        searchController.getFromSession(req,function(err,results){
            if (err){
                if (err !== 'couldnt get from session'){
                    res.writeHead(500, {"Content-Type": "application/json"});
                    var output = { error: true, data: err };
                    res.end(JSON.stringify(output) + "\n");
                }
            }else{
                req.data.query = results;
                console.log(results);
            }
            res.render("search",req.data);
        })
	});
    
    app.post('/useage-profile', updateUseageProfileAndLoadWarehouse, function(req, res) {
        // return some data once we've updated everything.
       	res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(req.data.warehouse.storageProfile) + "\n");
    });

};

function searchHandler(req,res){
    var resultsData = req.data.results;
    resultsData.userWarehouse = req.data.userWarehouse;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(resultsData));
}

function isNewSearchCompatableWithSessionSearch(newSearch, sessionSearch) {
    return (
      newSearch.totalPallets == sessionSearch.totalPallets &&
      newSearch.minDuration == sessionSearch.minDuration
    )
}

function isSessionSearchEqualToQuery(newSearch, sessionSearch){
    return(
        newSearch.totalPallets === sessionSearch.totalPallets &&
        newSearch.minDuration === sessionSearch.minDuration &&
        newSearch.postcode === sessionSearch.postcode &&
        newSearch.radius === sessionSearch.radius &&
        parseInt(newSearch.palletType) === sessionSearch.palletType &&
        newSearch.weight === sessionSearch.weight &&
        newSearch.height === sessionSearch.height &&
        parseInt(newSearch.temp) === sessionSearch.temp &&
        newSearch.startDate.valueOf() === new Date(sessionSearch.startDate).valueOf() &&
        newSearch.description === sessionSearch.description &&
        newSearch.maxDistance === newSearch.maxDistance &&
        newSearch.radiusInMetres === newSearch.radiusInMetres
    )
}

function saveSearchAndDoSearch(req,res, next){
    var query = getQueryFromRequest(req); //this has a new blank useage profile.. we need to check if we need to preserve the old one..
    var sameSearch;
    searchController.getFromSession(req, function(err, sessionQuery) {
        if (!err && sessionQuery && sessionQuery.useageProfile) { //does an existing query exist in the session with a useageprofile attached?
            if  (isNewSearchCompatableWithSessionSearch(query, sessionQuery) ) { //compare the session search to the new one. if all the important values are the same then we should preserve the existing useage profile. If numPallets etc. have changed then it makes sense to use a blank useage profile.
                query.useageProfile = sessionQuery.useageProfile;
            }
            if (isSessionSearchEqualToQuery(query,sessionQuery)){
                sameSearch = true;
            }else{
                sameSearch = false;
            } 
        }       
        saveSearch(query, req);
        doSearch(query, req, res, sameSearch, next); 
        
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
                req.data.searchId = query._id;
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

function doSearch(query,req,res,sameSearch,next) {
    searchController.search_storage(query, function(error, results) {
        if (error) {
            req.data.error = error;
        }
        req.data.results = results;
            if (sameSearch === true || sameSearch == undefined){
                getSelectedWarehousesbyUser(req,function(err,userWarehouse){
                    req.data.userWarehouse = userWarehouse;
                    next();
                });
            }else{
                deleteUserWarehouseByUser(req);
                 next();
            }
    });
}

function getSelectedWarehousesbyUser(req,cb){
    if (req.data.user._id){
        userWh.loadByUser(req.data.user,req,function(err,result){
            var userWarehouse = [];
            if(!err){
                for (var i = 0; i < result.length; i++){
                    userWarehouse.push(result[i]._doc);
                }
            }
            cb(err,userWarehouse);
        });
    }else{
        cb();
    }
}

function deleteUserWarehouseByUser(req){
    if (req.data.user._id){
        userWh.removeByUser(req.data.user,function(err,result){
            if(!err){
            }
        });
    }else{
    }
}

function deleteUserWarehouse(id){
    userWh.remove(id,function(err,result){
        if(!err){
        }
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
        for (var i = 0; i<newUseageProfile.length; i++) {
            for (var key in newUseageProfile[i]){
                newValueOfRowThatChanged = newUseageProfile[i][key];
                for (var j = 0; j<currentUseageProfile.length; j++){
                    if (key in currentUseageProfile[j]) {
                        currentUseageProfile[j][key] = newUseageProfile[i][key];
                        indexOfRowThatChanged = j;//for now we can only change one row at a time so we only need to store one index.
                    }
            }
            }
        }
        
        
        var weekNo = 0;
        //we look at the row that changed, and cascade that volume down to lower rows... this is a UI requirement.
        for ( var k = 0; k<currentUseageProfile.length; k++) {
            for (var l in currentUseageProfile[k]){
                if (weekNo == 0) { //while we're here, we grab the first week pallet useage if it changed and update the search criteria totalPallets with this value.
                    if (indexOfRowThatChanged == k) {
                        sessionQuery.totalPallets = newUseageProfile[k][l];
                    }
                }
                if (new Date(l) > new Date(key)) {
                    currentUseageProfile[k][l] = newValueOfRowThatChanged;
                }
                weekNo++;
            }
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
    var entryArr = [];
    entry[wcDate.toISOString().substr(0,10)] = newValue;
    entryArr.push(entry);
    entry = {};
    return entryArr;
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
            "useageProfile"     : useageProfile,
            "id"                : req.body["search-id"]
        };
        return query;
}

module.exports = handler;