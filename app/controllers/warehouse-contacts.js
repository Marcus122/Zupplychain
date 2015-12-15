var WarehouseContacts = require("../data/warehouse-contacts.js");
var User = require ("../controllers/users.js");
var Warehouse = require("../controllers/warehouses.js");
var company = require("../controllers/company.js");
var local = require("../local.config.js");
exports.version = "0.1.0";

exports.updateAvailabilityController = function(warehouseContact,user,cb,sortOrder){
	WarehouseContacts.update({_id:warehouseContact},{$push:{availabilityController:{'user':user,'sortOrder':sortOrder}}}).exec(cb);	
}

exports.updateEnquiresController = function(warehouseContact,user,cb,sortOrder){
	WarehouseContacts.update({_id:warehouseContact},{$push:{enquiresController:{'user':user,'sortOrder':sortOrder}}}).exec(cb);	
}

exports.updateTransportCoordinator = function(warehouseContact,user,cb,sortOrder){
	WarehouseContacts.update({_id:warehouseContact},{$push:{transportCoordinator:{'user':user,'sortOrder':sortOrder}}}).exec(cb);	
}

exports.updateGoodsIn = function(warehouseContact,user,cb,sortOrder){
	WarehouseContacts.update({_id:warehouseContact},{$push:{goodsIn:{'user':user,'sortOrder':sortOrder}}}).exec(cb);	
}

exports.updatePickingDispatch = function(warehouseContact,user,cb,sortOrder){
	WarehouseContacts.update({_id:warehouseContact},{$push:{pickingDispatch:{'user':user,'sortOrder':sortOrder}}}).exec(cb);	
}

exports.updateInvoiceController = function(warehouseContact,user,cb,sortOrder){
	WarehouseContacts.update({_id:warehouseContact},{$push:{invoiceController:{'user':user,'sortOrder':sortOrder}}}).exec(cb);	
}

exports.updateCreditController = function(warehouseContact,user,cb,sortOrder){
	WarehouseContacts.update({_id:warehouseContact},{$push:{creditController:{'user':user,'sortOrder':sortOrder}}}).exec(cb);	
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
				Warehouse.getById(results[i].warehouse,function(err,warehouse){
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
			WarehouseContacts.deleteWhContact(warehouseContactId,userId,contactType,function(err,result){
				if(err){
					cb(err);
				}else{
					//for (var i = 0; i<userIds.length; i++){
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
										User.updateDashboardAccessLevel(userId,local.config.dashboardAccessLevel.masterContact,function(err,result){
											if(err){
												cb(err);
											}else{
												cb(false);
											}
										});
									}
								});
							}else{
								User.checkCorrectDashboardAccessLevelAndUpdate(userId,function(err,result){
									if(err){
										cb(err);
									}else{
										cb(false);
									}
								});
							}
						});
					//}
				}
			});
		}
	});
}

exports.loadWarehousesByUser = function(userId,cb){
	var userWarehouses = [],
	cbCompleted = 0;
	WarehouseContacts.loadByUser(userId,function(err,results){
		if(err){
			cb(err);
		}else{
			for (var i = 0; i<results.length; i++){
				Warehouse.getById(results[i].warehouse,function(err,warehouse){
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

exports.getHighestDashboardAccessLevelByUser = function(user,cb){
	var dashboardAccessLevel = 2;
	var object;
	WarehouseContacts.loadByUser(user,function(err,results){
		if(err){
			cb(err)
		}else{
			for(var i = 0; i<results.length; i++){
				object = results[i].toObject();
				for (var j in object){
					if (object[j].constructor === Array){
						for (var k = 0; k<object[j].length; k++){
							if(object[j][k] == user && dashboardAccessLevel > local.config.dashboardAccessLevel[j]){
								dashboardAccessLevel = local.config.dashboardAccessLevel[j];
							}
						}
					}
				}
			}
			cb(false,dashboardAccessLevel);
		}
	})
}