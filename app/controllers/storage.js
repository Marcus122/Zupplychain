var Storage = require("../data/storage.js"),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
/**
 * Warehouse class.
 */
exports.create = function (warehouse,data,cb) {
	var storage = new Storage(data);
	storage.save(function(err){
		if (!err) {
			warehouse.storage.push(storage._id);
			warehouse.save(function(){
				return cb(null, storage);
			});
		  }else{
			 return cb(err);
		 }
	});
}