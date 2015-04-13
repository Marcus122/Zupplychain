var path = require("path"),
		util = require("util"),
		utils = require("./utils"),
		Postcode = require("postcode"),
		BasicResource = require(path.join(__dirname, "basicresource"));

function Vicinity(client) {
	BasicResource.call(this, client);
}

util.inherits(Vicinity, BasicResource);

Vicinity.prototype.get = function (vicinity, radius, callback) {
	if (utils.validGeolocation(vicinity)) {
		this._PostcodesfromGeolocation(vicinity, radius, callback);
	} else if (new Postcode(vicinity).valid()) {
		this._PostcodesfromPostcode(vicinity, radius, callback);
	} else {
		return callback(new Error("Unabled to lookup postcodes due to invalid vicinity"), null);
	}
}

Vicinity.prototype._PostcodesfromPostcode = function (postcode, radius, callback) {
	this._request({
		path: ["/postcode/nearest?postcode=", postcode, "&miles=", radius,"&format=json"].join("")
	}, callback);
}

Vicinity.prototype._PostcodesfromGeolocation = function (location, radius, callback) {
	var lat = utils.getLat(location),
			lon = utils.getLon(location);
	this._request({
		path: ["/postcode/nearest?lat=", lat, "&lng=", lon, "&miles=", radius,"&format=json"].join("")
	}, callback);	
}

module.exports = Vicinity;