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

exports.removeByUser = function(user,next){
	UserWh.removeByUser(user,function(err){
		if (err){
			console.log("Failed to remove document(s)");
			return next(new Error('not removed'));
		}else{
			return next();
		}
	});
}

exports.remove = function(id,next){
	UserWh.remove(id,function(err){
		if (err){
			console.log("Failed to remove document(s)");
			return next(new Error('not removed'));
		}else{
			return next();
		}
	});
}