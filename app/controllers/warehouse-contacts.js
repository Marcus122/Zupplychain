var WarehouseContacts = require("../data/warehouse-contacts.js");
var User = require ("../data/user.js");
exports.version = "0.1.0";

exports.updateAvailabilityController = function(warehouseContact,user,cb){
	WarehouseContacts.update({_id:warehouseContact},{$push:{availabilityController:user}}).exec(cb);	
}

exports.updateEnquiresController = function(warehouseContact,user,cb){
	WarehouseContacts.update({_id:warehouseContact},{$push:{enquiresController:user}}).exec(cb);	
}

exports.createWarehouseContacts = function(warehouse,masterContacts,contacts,cb){
	var warehouseContacts = new WarehouseContacts(contacts);
	User.findOne({_id: warehouse.user._id},function(err,user){
		if (!err){
			user.masterContacts = masterContacts;
			user.save(function(err){
				if (!err){
					warehouseContacts.save(function(err){
						if (!err){
							warehouse.contacts = warehouseContacts._id;
							warehouse.save(function(err){
								if (!err){
									return cb(null,warehouseContacts)
								}else{
									return cb(err);
								}
							})
						}else{
							return cb(err);
						}
					});
				}else{
					return cb(err);
				}
			});
		}else{
			return cb(err);
		}
	})
}

exports.load = function(id,cb){
	WarehouseContacts.load(id,function(err,result){
		if(err){
			cb(err);
		}else{
			cb(null,result);
		}
	})
}