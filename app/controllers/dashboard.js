var user = require("../controllers/users.js");
var companyCtrl = require("../controllers/company.js");
var local = require("../local.config.js");
var warehouse = require("../controllers/warehouses.js");
var warehouseContacts = require("../controllers/warehouse-contacts.js");
var Utils = require("../utils.js");
exports.version = "0.1.0";

exports.saveBasicAccountDetails = function(name,email,company,phoneNumber,user,warehouse,cb){
	user.name = name;
	user.email = email;
	user.phoneNumber = phoneNumber;
	user.company.name = company;
	user.save();
	user.company.save();
	warehouse.company = company;
	warehouse.save(cb);
}

exports.changePassword = function(user,password,cb){
	user.password = password;
	user.save(cb);
};

exports.checkUserExistsandCreateUser = function(req,res,data,cb){
	user.user_by_email(data.email,function(err,results){
		if(err){
			cb(err);
		}else{
			if (results === null){
				user.create(req,res,data,function(err,result){
					if(err){
						cb(err);
					}else{
						cb(false,result,false);
					}
				},false);
			}else{
				if(data.dashboardAccessLvl < results.toObject().dashboardAccessLvl){
					results.dashboardAccessLvl = data.dashboardAccessLvl;
					user.update(results,function(err,result){
						if(err){
							cb(err)
						}else{
							cb(false,results,true);
						}
					},true)
				}else{
					cb(false,results,true);
				}
			}
		}
	});
};

exports.getWarehousesByUser = function(user,cb){
	var auth,
		cntr,
		method,
		importParam,
		data = {};
	if(user.dashboardAccessLvl === 0){
		cntr = companyCtrl;
		method = 'warehouseByCompany'
		importParam = user.toObject().company;
	}else{
		cntr = warehouse;
		method = 'warehousesByUser';
		importParam = user._id;
	}
	cntr[method](importParam,function(err,warehouses){
		if (err){
			cb(err);
		}else{
			companyCtrl.getMasterContactsUserData(user.toObject().company,function(err,masterContacts){
				data.warehouses = warehouses.sort(function(x,y){return new Date(x.created).getTime() - new Date(y.created).getTime()});
				data.warehouse = data.warehouses[0];
				data.masterContacts = masterContacts;
				data.temperatures = local.config.temperatures;
				data.services = local.config.services;
				data.palletTypes = local.config.palletTypes;
				data.specifications = local.config.specifications;
				data.registerStatus = local.config.registerStatus;
				auth = local.config.authorisationsByAccessLvl[user.dashboardAccessLvl]
				data.authorisations = local.config.authorisations[auth];
				data.dashboardAccessLvl = user.dashboardAccessLvl;
				cb(false,data);
			});
		}
	});
}

exports.getTasksThatHaveBeenCompleted = function(data){
	var completedTasks = [];
	var numCompleted = 0;
	var tasks = {}
	var numberOfArrays = 0;
	var completedWarehouses = 0;
	completedTasks.masterContact = {};
	if(data.masterContacts.length >= 2){
		completedTasks.masterContact.allRequestsSent = true;
		if(data.masterContacts[0].expiry === null && data.masterContacts[1].expiry === null){
			completedTasks.masterContact.allRequestsResponded = true;
		}else{
			completedTasks.masterContact.allRequestsResponded = false;
		}
	}else{
		completedTasks.masterContact.allRequestsSent = false;
		completedTasks.masterContact.allRequestsResponded = false;
	}
	for(var j = 0; j<data.warehouses.length; j++){
		numCompleted = 0;
		numberOfArrays = 0;
		var warehouseId = data.warehouses[j].id;
		tasks[warehouseId] = {};
		var contacts  = data.warehouses[j].toObject().contacts
		for(var i in contacts){
			tasks[warehouseId][i] = {};
			if (contacts[i].constructor === Array){
				numberOfArrays ++;
				if(contacts[i].length === 2){
					tasks[warehouseId][i].allRequestsSent = true;
					if(contacts[i][0].expiry === null && contacts[i][1].expiry === null){
						tasks[warehouseId][i].allRequestsResponded = true;
						numCompleted ++;
					}else{
						tasks[warehouseId][i].allRequestsResponded = false;
					}
				}else{
					tasks[warehouseId][i].allRequestsSent = false;
					tasks[warehouseId][i].allRequestsResponded = false;
				}
			}
		}
		if(numberOfArrays === numCompleted){
			tasks[warehouseId].contactSetupComplete = true;
			completedWarehouses ++;
		}else{
			tasks[warehouseId].contactSetupComplete = false;
		}
		
		if(completedWarehouses === data.warehouses.length){
			completedTasks.allWarehousesCompleted = true;
		}else{
			completedTasks.allWarehousesCompleted = false;
		}
		completedTasks.numWarehousesCompleted = completedWarehouses;
		completedTasks.push(tasks);
	}
	return completedTasks;
}

exports.deleteItems = function(req,res,cb){
    var cbCompleted = 0;
	var errOccured = false;
	var results = [];
	if (req.body.type === 'warehouse' || req.body.type === 'warehouses'){
		//for(var i = 0; i<req.body.ids.length; i++){
			warehouse.deleteWarehouseById(req.body.id,function(err,result){
				cbCompleted ++;
				if(err){
					errOccured = true;
				}else{
					results.push(result);
				}
				if (cbCompleted === req.body.ids.length){
					cb(errOccured,results);
				}
			});
		//}
	}else if(req.body.type === 'warehouseSpecificContacts' || req.body.type === 'warehouseSpecificContact'){
		warehouseContacts.deleteContact(req.body.id,req.body.subType,req.body.warehouseContactId,function(err,result){
			//cbCompleted ++;
			if(err){
				errOccured = true;
			}else{
				results.push(result);
			}
			companyCtrl.updateContactsReminderSent(req.body.company,false,function(err){
				cb(errOccured,results);
			});
		});
	}else if(req.body.type === 'masterContacts' || req.body.type === 'masterContact'){
		//for(var i = 0; i<req.body.ids.length; i++){
			companyCtrl.deleteMasterContact(req.body.company,req.body.id,function(err,result){
				//cbCompleted ++;
				if(err){
					errOccured = true;
				}else{
					results.push(result);
				}
				//if (cbCompleted === req.body.ids.length){
					companyCtrl.updateContactsReminderSent(req.body.company,false,function(err){
						cb(errOccured,results);
					});
				//}
			});
		//}
	}
}

exports.getAuthorisations = function(dashboardAccessLvl){
	var auth = local.config.authorisationsByAccessLvl[dashboardAccessLvl]
	return local.config.authorisations[auth];
}