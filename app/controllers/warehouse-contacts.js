var WarehouseContacts = require("../data/warehouse-contacts.js");
var User = require ("../data/user.js");
exports.version = "0.1.0";

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