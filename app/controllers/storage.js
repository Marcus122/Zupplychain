var Storage = require("../data/storage.js"),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
/**
 * Warehouse class.
 */
exports.create = function (data,cb) {
	var storage = new Storage(data);
	storage.save(function(err){
		if (!err) {
			  return cb(null, storage);
		  }else{
			 return cb(err);
		 }
	});
}
exports.updateWithData = function(_data,cb){
	Storage.findOne({ _id : _data.id },function(err,storage){
		if(!err){
			storage.set(_data);
			storage.save(function(err){
				if (!err) {
					  return cb(null, storage);
				  }else{
					 return cb(err);
				 }
			});
		}else{
			return cb(err);
		}
	});
}