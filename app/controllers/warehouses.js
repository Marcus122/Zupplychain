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
	Warehouse.load(id,function(err,warehouse){
		if(err || !warehouse){
			return next(new Error('not found'));
		}else{
			//Check warehouse is for user
			req.warehouse = warehouse;
			return next();
		}
	});
};
exports.update = function(warehouse,data,cb){
	warehouse.specifications=[];
	warehouse.services=[];
	warehouse.set(data);
	warehouse.save(cb);
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

exports.warehouse_by_query = function(query,cb) {
    // do the actual search and return the warehouse data.
    Warehouse.search_by_query(query, function(err,result){
        var error = "";
		var data;
        if (err) {
            error = 'There were no results for your search';
        } else {
            data = {results : result};
        }
        return cb(error,data);
    });
}