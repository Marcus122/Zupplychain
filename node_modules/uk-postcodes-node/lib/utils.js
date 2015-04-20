module.exports = { 
	toQueryString: function (obj) {
    var parts = [];
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
        }
    }
    return parts.join("&");
	},

	validGeolocation: function (locationString) {
		if (typeof locationString !== "string") {
			return false;
		}
		
		var sep = locationString.split(",");
		if (sep.length !== 2) {
			return false;
		}
		var lat = parseInt(sep[0], 10),
				lon = parseInt(sep[1], 10);
		if (isNaN(lat) || isNaN(lon)) {
			return false;
		}
		
		if (Math.abs(lon) > 180 || Math.abs(lat) > 180) {
			return false;
		}

		return true;
	},

	getLon: function (locationString) {
		return locationString.split(",")[1];
	},

	getLat: function (locationString) {
		return locationString.split(",")[0];
	}
};