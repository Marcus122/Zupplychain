var Company = require("../data/company.js");
var warehouse = require("../controllers/warehouses.js");
var warehouseContacts = require("../controllers/warehouse-contacts.js")
var User = require("../controllers/users.js");
var local = require("../local.config.js");

exports.version = "0.1.0";

exports.updateMasterContacts = function(company,user,cb){
	Company.update({_id:company},{$push:{masterContacts:user}}).exec(cb);	
}

exports.updateWarehouses = function(company,warehouse,cb){
	Company.update({_id:company},{$push:{warehouses:warehouse}}).exec(cb);	
}

exports.create = function(req,res,company,cb){
		var comp = new Company(company);
		comp.save(function(err){
			if(!err){
				return cb(null,comp.toObject());
			}else{
				cb(err);
			}
		});
};

exports.findByUser =  function(user,callback){
	Company.loadByUser(user,function(err,company){
		if(err){
			return callback(err);
		}else{
			return callback(null,company);
		}
	});
};

exports.getMasterContactsUserData = function(company,cb){
	var cbCompleted = 0;
	var masterContacts = [];
	Company.load(company,function(err,result){
		var resultObj = result.toObject();
		for (var i = 0; i < resultObj.masterContacts.length; i++){
			User.user_by_id(resultObj.masterContacts[i],function(err,user){
				if(err){
					//Do nothing, the warehouse will not be in the results
				}else{
					cbCompleted ++;
					masterContacts.push(user.toObject())
					if(resultObj.masterContacts.length === cbCompleted){
						cb(null,masterContacts);
					}
				}
			});
		}
	});
}

exports.warehouseByCompany = function(company,callback){
	var warehouses = [];
	var cbCompleted = 0;
	Company.load(company,function(err,result){
		if(err){
			callback(err);
		}else{
			var resultObj = result.toObject();
			for (var i = 0; i < resultObj.warehouses.length; i++){
				warehouse.getById(resultObj.warehouses[i],function(err,warehouse){
					if(err){
						//Do nothing, the warehouse will not be in the results
					}else{
						cbCompleted ++;
						warehouses.push(warehouse)
						if(resultObj.warehouses.length === cbCompleted){
							callback(null,warehouses);
						}
					}
				});
			}
		}
	});
};

exports.checkUserIsMaterContact = function(userId,cb){
	Company.loadByUser(userId,function(err,result){
		if(err){
			cb(err);
		}else{
			if(result.length > 0){
				cb(false,true);
			}else if(result.length === 0){
				cb(false,false);
			}
		}
	});
}

exports.deleteMasterContact = function(company,userId,cb){
	User.user_by_id(userId,function(err,result){
		if(err){
			cb(err);
		}else{
			Company.removeMasterContact(company,result._id,function(err,result){
				if(err){
					cb(err);
				}else{
					warehouseContacts.checkWarehouseContactsExist(userId,function(err,exists){
						if(err){
						//See if there is a rollback function
							cb(err);
						}else if(!exists){
							exports.checkUserIsMaterContact(userId,function(err,exists){
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
				}
			});
		}
	});
}