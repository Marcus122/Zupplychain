var mongoose = require('mongoose'),
	local = require("../local.config.js");

var host = local.config.db_config.host
    ? local.config.db_config.host
    : 'localhost';
var database = local.config.db_config.database
	? local.config.db_config.database : 'ZupplyChain';
	
var db;

/**
 * Currently for initialisation, we just want to open
 * the database.  We won't even attempt to start up
 * if this fails, as it's pretty pointless.
 */
exports.init = function (callback) {
	mongoose.connect('mongodb://' + host + '/' + database)

	db = mongoose.connection;

	db.on('error', function(err){ console.log(err) });
	db.once('open', function (callback) {
		console.log("Mongoose Success");
	});
    
    return db;
    
};

exports.getInstance = function(){
	return db;
}
