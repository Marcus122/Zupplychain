//var UKPostcodes = require("uk-postcodes-node");
var warehouse = require("../controllers/warehouses");
var Search = require("../data/search");


var extra = {
	apiKey : '',
	formatter: null
};
var geocoderProvider = 'google';
var httpAdapter = 'http';
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);

exports.clearSearchFromSession = function(req) {
    req.session.whSC = null;
}

exports.saveSearch = function(search, cb) {
    //if the search has an ID, then we update the record with that ID.
    if (search._id) {
        Search.update({"_id" : search._id}, search, {}, cb);
    } else {
        var mySearch = new Search(search);
        mySearch.save(cb);
    }
}
exports.getFromSession = function(req, cb) {
    if (req.session.whSC) {
        cb(false,req.session.whSC.sc[0]);
    } else {
        cb("couldnt get from session");
    }
}

exports.saveToSession = function(search,req,cb) {
    console.log("saving to session");
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
    getLatLong(postcode, function(error, geoData) {
       query.geo =  geoData;
       query.loc = {"type" : "Point", "coordinates" : [query.geo.lng, query.geo.lat]} ; //always long then lat
       var result = warehouse.warehouse_by_query(query, function(error,res) {
           cb(null,res);
       });
    });

    function getLatLong(postcode,cb){
        var geo = {
            lat:52.00,
            lng:-2.00
        };
        if(!postcode) return cb(null,geo);
		
		geocoder.geocode(postcode, function(error, result){
			if(!error){
				geo.lat = result[0].latitude;
				geo.lng = result[0].longitude;
			}else{
				console.log ("in search.js");
                console.log("error in Google Geolocation module:");
                console.log(error);
			}
			return cb(null,geo);
		});
    }
    
}
