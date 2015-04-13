var path = require("path"),
		util = require("util"),
		BasicResource = require(path.join(__dirname, "basicresource"));

function Postcode (client) {
	BasicResource.call(this, client);
}

util.inherits(Postcode, BasicResource);

Postcode.prototype.get = function (postcode, callback) {
	this._request({
		path: "/postcode/" + postcode + ".json"
	}, callback);
}

module.exports = Postcode;