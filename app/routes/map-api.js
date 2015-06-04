var extra = {
	apiKey : '',
	formatter: null
};
var geocoderProvider = 'google';
var httpAdapter = 'http';
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);

var handler = function(app){
	app.get('/map-api/getLatLong', getLatLong);
	api.get('/map-api/generateMap', generateMap);
}