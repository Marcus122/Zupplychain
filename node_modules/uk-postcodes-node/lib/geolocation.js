var path = require("path"),
		util = require("util"),
		BasicResource = require(path.join(__dirname, "basicresource"));

function Geolocation (client) {
	BasicResource.call(this, client);
}

util.inherits(Geolocation, BasicResource);

Geolocation.prototype.get = function (geolocation, callback) {
	// http://uk-postcodes.com/latlng/[latitude],[longitude].['xml', 'csv', 'json'* or 'rdf']
	this._request({
		path: "/latlng/" + geolocation + ".json"
	}, callback);
}

module.exports = Geolocation;