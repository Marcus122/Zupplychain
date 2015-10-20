var Warehouse = require("../data/warehouse.js"),
	warehouseContacts = require("../data/warehouse-contacts.js"),
	mongoose = require('mongoose'),
	utils = require("../utils"),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
/**
 * Warehouse class.
 */
exports.updateWarehouseDocuments = function(warehouseId,documents,cb){
    Warehouse.update({"_id" : warehouseId}, { $set: { "documents": documents }}, {},cb);
}
exports.updateWarehousePhoto = function(warehouseId,photos,cb){
    Warehouse.update({"_id" : warehouseId}, { $set: { "photos": photos }}, {},cb);
}
exports.createWarehouseObject = function(data){
	var warehouse = new Warehouse(data);
	return warehouse;
}
exports.create = function (user,data,cb) {
	var warehouse = exports.createWarehouseObject(data);
	if (warehouse.defaultPhoto && warehouse.defaultPhoto.indexOf(warehouse.id + '/')===-1){
		warehouse.defaultPhoto = warehouse.id + '/' + warehouse.defaultPhoto;
	}
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
exports.getById = function(id, cb) {
    Warehouse.load(id,function(err,warehouse){
		if(err || !warehouse){
			return cb(new Error('not found'));
		}else{
			return cb(false, warehouse);
		}
	});
}
exports.load = function(req,res,next,id) {
	Warehouse.load(id,function(err,warehouse){
		if(err || !warehouse){
			console.log(err);
			return next(new Error('not found'));
		}else{
			//Check warehouse is for user
			console.log(warehouse);
			req.warehouse = warehouse;
			return next();
		}
	});
};
exports.update = function(warehouse,data,cb){
	if (data.defaultPhoto && data.defaultPhoto.indexOf(warehouse.id + '/')===-1){
		data.defaultPhoto =  warehouse.id + '/' + data.defaultPhoto;
	}
	if (warehouse.photos !== undefined){
		data.photos = warehouse.photos;
	}
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
exports.warehouseByACOrECUser = function(userId,cb){
	var userWarehouses = [],
		cbCompleted = 0;
	warehouseContacts.loadWarehousesContactsByACOrEC(userId,function(err,results){
		if(err){
			cb(err);
		}else{
			for (var i = 0; i<results.length; i++){
				Warehouse.load(results[i].warehouse,function(err,warehouse){
					if(err){
						//This warehouse won't appear in the list
					}else{
						userWarehouses.push(warehouse)
					}
					cbCompleted ++;
					if(cbCompleted === results.length){
						cb(false,userWarehouses)
					}
				});
			}
		}
	});
};
exports.removeWarehouse = function(id){
	Warehouse.remove(id);
}
exports.updateVolumeDiscount = function(warehouse, data, cb) {
    warehouse.noDiscount = data.noDiscount;
    warehouse.discounts = data.discounts;
    warehouse.save(cb);
}

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

//TODO : DELETE
/*exports.getStorageProfile =  function(query, warehouseId, cb) {
    Warehouse.getStorageProfile(query, warehouseId, cb);
};
exports.limitStorageToMatching = function(storage, query) {
    var result = Warehouse.filterStorageOnQuery(storage,query);
    return result;
};*/


};