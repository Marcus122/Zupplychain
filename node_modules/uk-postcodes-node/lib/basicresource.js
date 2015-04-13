var path = require("path"),
		extend = require("xtend"),
		util = require("./utils"),
		_ = require("underscore"),
		http = require("http");

function BasicResource (client) {
	this._client = client;
};

BasicResource.prototype._timeoutHandler = function(request, callback) {
	return function () {
		var error = new Error("Connection to ", this._client, " timed out. Unabled to retrieve data");
		request._isAborted = true;
		request.abort();
		callback(error, null);
	}
};

BasicResource.prototype._handleError = function (request, callback) {
	return function (err) {
		if (request._isAborted) return;
		var error = new Error(err);
		callback(error, null);
	}
};

BasicResource.prototype._handleResponse = function (request, callback) {
	var self = this;
	return function (response) {
		var result = "";
		response.setEncoding('utf8');

		response
		.on("data", function (data) {
			result += data;
		})
		.on("end", function () {
			// Need to handle infinite loop here, but I'm trusting uk-postcodes for now
			if (response.statusCode === 303) {
				var newOptions = extend(self.defaultRequest(), {
					path: response.headers.location
				});
				return self._request(newOptions, callback);
			}
			if (response.statusCode === 404) return callback(null, null);
			try {
				result = JSON.parse(result);
			} catch (error) {
				return callback(new Error("Invalid JSON response"), null);
			}
			callback(null, result);
		});
	}
};

BasicResource.prototype._request = function (requestOptions, callback) {
	// Clean path - remove spaces and then encodeURI
	var options = this.defaultRequest();

	options = extend(options, requestOptions);
	// Append path to URL
	options.path = encodeURI(options.path.split(" ").join(""));
	// Append query string
	if (!_.isEmpty(options.query)) {
		options.path += "?" + util.toQueryString(options.query);
	}

	var req = http.request(options);
	req.setTimeout(15000, this._timeoutHandler(req, callback));
	req.on("response", this._handleResponse(req, callback));
	req.on("error", this._handleError(req, callback));
	req.end();
};

BasicResource.prototype.defaultRequest = function () {
	return {
		host: this._client._api.host,
		port: this._client._api.port,
		method: "GET",
		path: "",
		query: {},
		headers: {
			"Accept" : "application/json",
			"Content-Type" : 'application/x-www-form-urlencoded',
			"User-Agent" : "uk-postcodes-node NodeBindings version " + this._client._api.version
		}
	}
};

module.exports = BasicResource;