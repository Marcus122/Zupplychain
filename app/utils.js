
function addDays(date, days) {
    return date.setDate(date.getDate() + days);
}

module.exports.test = function() {
    console.log("test");
}

//distance between two points on the earth's surface, in meters
module.exports.distanceInMiles = function(point1, point2) {
            function toRadians(degrees) { return degrees * Math.PI / 180; }
            var lat1 = point1.lat, lat2 = point2.lat, lon1 = point1.lng, lon2 = point2.lng;
            var φ1 = toRadians(lat1), φ2 = toRadians(lat2), Δλ = toRadians(lon2-lon1), R = 6371000; // gives d in metres
            var d = Math.acos( Math.sin(φ1)*Math.sin(φ2) + Math.cos(φ1)*Math.cos(φ2) * Math.cos(Δλ) ) * R;
            return Math.round(d * 0.0006213711);
}

module.exports.addDays = function(date, days) {
    return addDays(date, days);
}

module.exports.getClosestPreviousMonday = function(inDate) {
    var dayOfWeek = inDate.getDay();
    var retDate = new Date(inDate.getTime());
        //We 'pull' the start day back to the closest monday.
    if (dayOfWeek > 1) {
        addDays(retDate, -(dayOfWeek-1));
    } else if (dayOfWeek == 0) {
        addDays(retDate, -6);
    }
    return retDate;
}
        

module.exports.getLatLong = function(postcode, cb) {
    var extra = {
        apiKey : '',
        formatter: null
    };
    var geocoderProvider = 'google';
    var httpAdapter = 'http';
    var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);
    
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

