//var UKPostcodes = require("uk-postcodes-node");
var warehouse = require("../controllers/warehouses");
var extra = {
	apiKey : '',
	formatter: null
};
var geocoderProvider = 'google';
var httpAdapter = 'http';
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);


exports.search_storage = function(query, cb) {
    //need to convert postcode to lat lng and attach to the query.
   
    var postcode = query.postcode;
    getLatLong(postcode, function(error, geoData) {
       query.geo =  geoData;
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
        // UKPostcodes.getPostcode(postcode, function (error, data) {
            // if(!error){
                // geo.lat = data.geo.lat;
                // geo.lng = data.geo.lng;
                // console.log ("in search.js");
                // console.log("Successfully converted postcode to lat lng using the api");
            // } else {
                // console.log ("in search.js");
                // console.log("error in UK postcodes module:");
                // console.log(error);
            // }
            // return cb(null,geo);
        // });
		
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
