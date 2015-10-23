var WarehouseContacts = require("../data/warehouse-contacts.js");
var User = require ("../controllers/users.js");
var Warehouse = require("../data/warehouse.js");
var company = require("../controllers/company.js")
exports.version = "0.1.0";

exports.updateAvailabilityController = function(warehouseContact,user,cb){
	WarehouseContacts.update({_id:warehouseContact},{$push:{availabilityController:user}}).exec(cb);	
}

exports.updateEnquiresController = function(warehouseContact,user,cb){
	WarehouseContacts.update({_id:warehouseContact},{$push:{enquiresController:user}}).exec(cb);	
}

exports.updateTransportCoordinator = function(warehouseContact,user,cb){
	WarehouseContacts.update({_id:warehouseContact},{$push:{transportCoordinator:user}}).exec(cb);	
}

exports.updateGoodsIn = function(warehouseContact,user,cb){
	WarehouseContacts.update({_id:warehouseContact},{$push:{goodsIn:user}}).exec(cb);	
}

exports.updatePickingDispatch = function(warehouseContact,user,cb){
	WarehouseContacts.update({_id:warehouseContact},{$push:{pickingDispatch:user}}).exec(cb);	
}

exports.updateInvoiceController = function(warehouseContact,user,cb){
	WarehouseContacts.update({_id:warehouseContact},{$push:{invoiceController:user}}).exec(cb);	
}

exports.updateCreditController = function(warehouseContact,user,cb){
	WarehouseContacts.update({_id:warehouseContact},{$push:{creditController:user}}).exec(cb);	
}

exports.createWarehouseContacts = function(data,cb){
	var warehouseContacts = new WarehouseContacts(data);
	warehouseContacts.save(function(err,result){
		if(err){
			cb(err);
		}else{
			cb(null,result);
		}
	});
}

exports.load = function(id,cb){
	WarehouseContacts.load(id,function(err,result){
		if(err){
			cb(err);
		}else{
			cb(null,result);
		}
	});
}

exports.deleteByWarehouse = function(warehouse,cb){
	WarehouseContacts.removeByWarehouse(warehouse,function(err,result){
		if(err){
			cb(err);
		}else{
			cb(false,result);
		}
	})
}

exports.loadWarehousesContactsByACOrEC = function(userId,cb){
	var userWarehouses = [],
	cbCompleted = 0;
	WarehouseContacts.loadWarehousesContactsByACOrEC(userId,function(err,results){
		if(err){
			cb(err);
		}else{
			for (var i = 0; i<results.length; i++){
				Warehouse.load(results[i].warehouse,function(err,warehouse){
					if(err){
						//This warehouse won't appear in the list
					}else{
						userWarehouses.push(warehouse);
					}
					cbCompleted ++;
					if(cbCompleted === results.length){
						cb(false,userWarehouses)
					}
				});
			}
		}
	});
}

exports.deleteContact = function(userId,contactType,warehouseContactId,cb){
	WarehouseContacts.load(warehouseContactId,function(err,result){
		if(err){
			cb(err);
		}else{
			for (var i = 0; i<result[contactType].length; i++){
				if(result.toObject()[contactType][i].toString() === userId){
					result[contactType].splice(0,1);
					break;
				}
			}
			result.save(function(err,result){
				if(err){
					cb(err);
				}else{
					exports.checkWarehouseContactsExist(userId,function(err,exists){
						if(err){
							//See if there is a rollback function
							cb(err);
						}else if(!exists){
							company.checkUserIsMaterContact(userId,function(err,exists){
								if(err){
									cb(err);
								}else if(!exists){
									User.deleteUser(userId,function(err,result){
										if(err){
											cb(err);
											//See if there is a rollback function
										}else{
											cb(false,result);
										}
									});
								}else{
									cb(false);
								}
							});
						}else{
							cb(false);
						}
					})
				}
			});
		}
	});
}

exports.checkWarehouseContactsExist = function(userId,cb){
	WarehouseContacts.loadByUser(userId,function(err,result){
		if(err){
			cb(err);
		}else if(result.length !== 0){
			cb(false,true);
		}else if(result.length === 0){
			cb(false,false);
		}
	});
}