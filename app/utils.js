var googleDistance = require('google-distance');
function addDaysToDate(date, days) {
    date.setDate(date.getDate() + days);
    return date;
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
    return addDaysToDate(date, days);
}

module.exports.formatDate = function(date) {
    return date.toISOString().substr(0,10);
}

module.exports.getEndOfNextYear = function (date) {
    date.setYear(date.getFullYear() + 1);
    date.setMonth(11);
    date.setDate(31);
    return date;
}

module.exports.printFormatDate = function(date) {
    var dateString = date.toISOString();
    var yyyy = dateString.substr(0,4);
    var mm = dateString.substr(5,2);
    var dd = dateString.substr(8,2);
    return dd + "/" + mm + "/" + yyyy;
}

module.exports.getClosestPreviousMonday = function(inDate) {
    var dayOfWeek = inDate.getDay();
    var retDate = new Date(inDate.getTime());
        //We 'pull' the start day back to the closest monday.
    if (dayOfWeek > 1) {
        addDaysToDate(retDate, -(dayOfWeek-1));
    } else if (dayOfWeek == 0) {
        addDaysToDate(retDate, -6);
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
                if (result.length > 0){
                    geo.lat = result[0].latitude;
                    geo.lng = result[0].longitude;
                }else{
                    geo.lat = null;
                    geo.lng = null;
                }
			}else{
				console.log ("in utils.js");
                console.log("error in Google Geolocation module:");
                console.log(error);
			}
			return cb(error,geo);
		});
    
}

module.exports.checkUserSameAgainstLoadedWarehouse = function(warehouse,user){
    if (warehouse !== undefined){
        if (warehouse.user._id.equals( user._id)){
            return true;
        }else{
            return false;
        }
    }else{
        return false;//The user must be a customer, they need to log in as a provider
    }
}

module.exports.calculateQuickestRoadDistanceBetweenPoints = function(origin,destination,cb){
    googleDistance.get(
        {
        origin: origin,
        destination: destination,
        units: 'imperial',
        durationInTraffic: false
        },
        function(err,data){
            if (err){
                cb(err);
            }else{
            cb(null,data.distance);
            console.log(data);
            }
        }
    )
}

