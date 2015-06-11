var extra = {
	apiKey : '',
	formatter: null
};
var geocoderProvider = 'google';
var httpAdapter = 'http';
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);
var googleMapsLoader = require('google-maps');

var MAP_ELEM_ID = "map-container"

var handler = function(app){
	app.get('/map-api/getLatLong', populateLatLong, function(req,res){
		setLatLngResponse(req,res);
	});
	api.get('/map-api/generateMap', generateMap);
}

function populateLatLong(req,res){
	var geo = {
		lat:"",
		lng:""
	};
	if(!req.body.postcode) return cb(geo);
	geocoder.geocode(req.body.postcode, function(error, result){
		if(!error){
			if (result && result.length > 0) {
				geo.lat = result[0].latitude;
				geo.lng = result[0].longitude;
				req.data.geo = geo;
			} else { //we didn't get a result back from google.
				
			}
		}else{
			console.log ("in map-api.js");
			console.log("error in Google Geolocation module:");
			console.log(error);
		}
		return cb(geo);
	});
}

// function generateMap(req,res){
	// var loc1 = new google.maps.LatLng(0,0);
    // var mapOptions = {
		// center: loc1,
		// zoom: 14
    // };
	// GoogleMapsLoader.load(function(google) {
		// map = new google.maps.Map(document.getElementById(MAP_ELEM_ID), mapOptions);
		// populateLatLong(req,res
	// });
// }

function setLatLngResponse(req,res){
	res.writeHead(200, {"Content-Type": "application/json"});
	var output = { error: null, data: req.data.geo };
	res.end(JSON.stringify(output) + "\n");
}