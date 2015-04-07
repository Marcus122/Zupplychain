var Warehouse = require("../data/warehouse.js");
/**
 * Warehouse class.
 */
exports.create_warehouse = function (user,data,cb) {
	var warehouse = new Warehouse(data);
	warehouse.customer = user._id;
	warehouse.save(function(err){
		if (!err) {
			console.log("warehouse created");
			return cb(null, warehouse.toObject());
		  }else{
			 return cb(err);
		 }
	});
}
exports.update_warehouse = function(warehouse,cb){
	warehouse.save(function(err){
		if(!err){
			cb(null,user);
		}else{
			cb(err);
		}
	});
}
exports.warehouse_by_id = function (id,callback) {
	warehouse.findById(id,function(err,warehouse){
		if(err){
			return callback(err);
		}else{
			return callback(null,warehouse)
		}
	});
};