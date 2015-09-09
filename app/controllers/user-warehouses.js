var UserWh = require("../data/user-warehouses.js");
	
exports.createUserWarehouse = function(userId,warehouseId,validTo,validfrom,cb){
	var userWarehouse = {};
	
	userWarehouse.user = userId;
	userWarehouse.warehouse = warehouseId;
	userWarehouse.validTo = validTo;
	userWarehouse.validFrom = validfrom;
	
	var myUserWarehouse = new UserWh(userWarehouse);
	myUserWarehouse.save(cb);
}

exports.load = function(req,res,next,id){
	UserWh.load(id,function(err,userWarehouse){
		if (err || !userWarehouse){
			console.log("Failed to load user warehouse");
			return next(new Error('not found'));
		}else{
			req.userWarehouse = userWarehouse;
			return next();
		}
	});
}

exports.loadByUser = function(userId,req,next){
	UserWh.loadByUser(userId,function(err,userWarehouse){
		if (err || !userWarehouse){
			console.log("Failed to load user warehouse by user id");
			return next(new Error('not found'));
		}else{
			req.data.userWarehouse = userWarehouse.toString();
			return next(err,userWarehouse);
		}
	});
}

exports.loadByWarehouse = function(req,res,next,warehouseId){
	UserWh.loadByWarehouse(warehouseId,function(err,userWarehouse){
		if (err || !userWarehouse){
			console.log("Failed to load user warehouse by warehouse");
			return next(new Error('not found'));
		}else{
			req.userWarehouse = userWarehouse;
			return next();
		}
	});
}