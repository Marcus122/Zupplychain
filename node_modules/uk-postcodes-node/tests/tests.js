var UKPostcodes = require("../index"),
		path = require("path"),
		fs = require("fs"),
		maxApiTimeout = 20000, // Max time for API to respond before we fail test
		assert = require("chai").assert;

var isPostcodeResult = function(result, testPostcode) {
	if (testPostcode) {
		assert.equal(result.postcode, testPostcode)	
	}
	assert.property(result, "geo");
	assert.property(result, "administrative");
	assert.property(result.geo, "lat");
	assert.property(result.geo, "lng");
}

var isSimplePostcodeResult = function (result) {
	assert.property(result, "lat");
	assert.property(result, "lng");	
}

describe("UKPostcode#getPostcode", function () {
	this.timeout(maxApiTimeout);

	var testPostcode = "NW1 9HZ",
			bogusPostcode = "ID1 1QD";

	it ("Should return postcode data", function (done) {
		UKPostcodes.getPostcode(testPostcode, function (error, result) {
			if (error) throw error;
			isPostcodeResult(result, testPostcode);
			done();
		});
	});

	it ("Should return null if postcode does not exist", function (done) {
		UKPostcodes.getPostcode(bogusPostcode, function (error, result) {
			if (error) throw error;
			assert.isNull(result);
			done();
		});
	});
});

describe("UKPostcode#nearestPostcode", function () {
	this.timeout(maxApiTimeout);
	var testLocation = "52.9667,-1.1667",
			bogusLocation = "0,0";

	it ("should return the nearest postcode", function (done) {
		UKPostcodes.nearestPostcode(testLocation, function (error, result) {
			if (error) throw error;
			isPostcodeResult(result);
			done();
		});
	});

	// API issue to be resolved
	it ("should return null if something can't be found", function (done) {
		UKPostcodes.nearestPostcode(bogusLocation, function (error, result) {
			if (error) throw error;
			assert.isNull(result);
			done();
		});
	});
});

describe("UKPostcode#nearestPostcodes", function () {
	this.timeout(maxApiTimeout);
	var radius = 0.1;
	describe("Using a postcode", function () {
		var testPostcode = "OX173PL",
				bogusPostcode = "ID1 1QD";
		it ("should return a list of postcodes", function (done) {
			UKPostcodes.nearestPostcodes(testPostcode, radius, function (error, results) {
				if (error) throw error;
				results.forEach(function (postcode) {
					isSimplePostcodeResult(postcode);
				});
				done();
			});
		});
		it ("should return null if invalid postcode");
	});
	// Todo
	describe("Using longitude and latitude", function () {
		var testLocation = "52.9667,-1.1667",
				bogusLocation = "0,0";
		it ("should return a list of postcodes", function (done) {
			UKPostcodes.nearestPostcodes(testLocation, radius, function (error, results) {
				if (error) throw error;
				results.forEach(function (postcode) {
					isSimplePostcodeResult(postcode);
				});
				done();
			});
		});
		it ("should return null if invalid lon/lat");
	});
	describe("Invalid lookup", function () {
		it ("should return an error for lookups which are neither a postcode or geolocation", function (done) {
			UKPostcodes.nearestPostcodes("BOGUS", radius, function (error, result) {
				assert.isNotNull(error);
				done();
			});
		});
	});
});