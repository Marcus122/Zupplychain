var Warehouse = require("../data/warehouse.js"),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
/**
 * Warehouse class.
 */
exports.create = function (user,data,cb) {
	var warehouse = new Warehouse(data);
	warehouse.user = user._id;
	warehouse.save(function(err){
		if (!err) {
			console.log("warehouse created");
			return cb(null, warehouse);
		  }else{
			 return cb(err);
		 }
	});
}
exports.load = function(req,res,next,id) {
	if(!req.data.user._id) return next(new Error('not found'));
	Warehouse.load(id,function(err,warehouse){
		if(err){
			console.log(err)
			return next(new Error('not found'));
		}else{
			//Check warehouse is for user
			if(warehouse.user != req.data.user._id){
				return next(new Error('not found'));
			}else{
				req.warehouse = warehouse;
				return next();
			}
		}
	});
};
exports.update = function(warehouse,data,cb){
	warehouse.specifications=[];
	warehouse.services=[];
	warehouse.set(data);
	warehouse.save(function(err){
		cb(err);
	});
}
exports.warehouse_by_user = function (user,callback) {
	Warehouse.loadByUser(user,function(err,warehouses){
		if(err){
			return callback(err);
		}else{
			return callback(null,warehouses)
		}
	});
};