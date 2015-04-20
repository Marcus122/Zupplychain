var Storage = require("../data/storage.js"),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
/**
 * Warehouse class.
 */
exports.create = function (user,data,cb) {
	var storage = new Storage(data);
	storage.user = user._id;
	storage.save(function(err){
		if (!err) {
			  return cb(null, storage);
		  }else{
			 return cb(err);
		 }
	});
}
exports.updateWithData = function(_data,cb){
	Storage.findOne({ _id : _data._id },function(err,storage){
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
exports.load = function(req,res,next,id){
	Storage.load(id,function(err,storage){
			if(err) return next(err);
			if(!storage) return next(new Error("not found"))
			req.storage = storage;
			next();
	});
};
exports.update = function(storage,data,cb){
	storage.set(data);
	storage.save(cb);
}