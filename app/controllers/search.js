var UKPostcodes = require("uk-postcodes-node");
var warehouse = require("../controllers/warehouses");


exports.search_storage = function(query, cb) {
    //need to convert postcode to lat lng and attach to the query.
   
    var postcode = query.postcode;
    getLatLong(postcode, function(geoData) {
       query.geo =  geoData;
       var result = warehouse.warehouse_by_query(query, function(res) {
           cb(res);
       });
    });
    
    
    function getLatLong(postcode,cb){
        var geo = {
            lat:52.00,
            lng:-2.00
        };
        if(!postcode) return cb(geo);
        UKPostcodes.getPostcode(postcode, function (error, data) {
            if(!error){
                geo.lat = data.geo.lat;
                geo.lng = data.geo.lng;
                console.log ("in search.js");
                console.log("Successfully converted postcode to lat lng using the api");
            } else {
                console.log ("in search.js");
                console.log("error in UK postcodes module:");
                console.log(error);
            }
            return cb(geo);
        });
    }
    
    
}
