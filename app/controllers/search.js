//var UKPostcodes = require("uk-postcodes-node");
var warehouse = require("../controllers/warehouses");
var Search = require("../data/search");
var Utils = require("../utils.js");

exports.clearSearchFromSession = function(req) {
    req.session.whSC = null;
}

exports.saveSearch = function(search, cb) {
    //if the search has an ID, then we update the record with that ID.
    if (search._id) {
        console.log("saving seach to DB, has an id which is " + search._id);
        Search.update({"_id" : search._id}, search, {}, cb);
    } else {
        console.log("saving new search to the db");
        var mySearch = new Search(search);
        mySearch.save(cb);
    }
}

exports.getFromSession = function(req, cb) {
    if (req.session.whSC) {
        console.log("loading search from session");
        console.log("id is" + req.session.whSC.sc[0]._id);
        cb(false,req.session.whSC.sc[0]);
    } else {
        cb("couldnt get from session");
    }
}

exports.saveToSession = function(search,req,cb) {
    console.log("saving to session");
    console.log("id" + search._id);
    console.log("totalPallets : " + search.totalPallets);
    if (!(search.startDate instanceof Date)) {
        search.startDate = new Date(search.startDate);
    }
    search.startDate = search.startDate.toISOString().substr(0,10);
    var searchJSON = { "sc" : [search] };
    req.session.whSC = searchJSON;
    if(cb) {
        cb();
    }
}

exports.search_storage = function(query, cb) {
    //need to convert postcode to lat lng and attach to the query.
    var postcode = query.postcode;
    Utils.getLatLong(postcode, function(error, geoData) {
       query.geo =  {"lng": geoData.lng, "lat": geoData.lat};
       query.loc = {"type" : "Point", "coordinates" : [query.geo.lng, query.geo.lat]} ; //always long then lat
       var result = warehouse.warehouse_by_query(query, function(error,res) {
           cb(null,res);
       });
    });
}

exports.generateBlankUseageProfile = function(startDate, numWeeks, qty) {
    var dateKey = startDate.toISOString().substr(0,10);
        var useageProfile = {}
        useageProfile[dateKey] = qty;
        
        var startDateCopy = new Date(startDate.toISOString());
        for (var i = 1; i < numWeeks; i++) {
            Utils.addDays(startDateCopy,7);
            var key = startDateCopy.toISOString().substr(0,10);
            useageProfile[key] = qty;
        }
    return useageProfile;
}
