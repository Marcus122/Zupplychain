var user = require("../controllers/users.js");
var companyCtrl = require("../controllers/company.js");
var local = require("../local.config.js");
var warehouse = require("../controllers/warehouses.js");
var warehouseContacts = require("../controllers/warehouse-contacts.js")
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
		method = 'warehouseByACOrECUser'
		importParam = user._id;
	}
	cntr[method](importParam,function(err,warehouses){
		if (err){
			cb(err);
		}else{
			companyCtrl.getMasterContactsUserData(user.toObject().company,function(err,masterContacts){
				data.warehouses = warehouses;
				data.warehouse = warehouses[0];
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

function getEarliestCreatedWarehouse(warehouses){
	var earlistWarehouse = warehouses[0];//Start of with the first one in the list
	for (var i = 0; i<warehouses.length; i++){
		if (warehouses[i].created < earlistWarehouse.created){
			earlistWarehouse = warehouses[i];
		}
	}
	return earlistWarehouse;
}

exports.getTasksThatHaveBeenCompleted = function(data){
	var completedTasks = {};
	var numCompleted = 0;
	var numberOfArrays = 1; //Start at one because of master contacts
	var warehouseContacts = getEarliestCreatedWarehouse(data.warehouses).contacts;
	warehouseContacts = warehouseContacts.toObject();
	if(data.masterContacts.length >= 2){
		completedTasks.masterContact = true;
		numCompleted ++;
	}else{
		completedTasks.masterContact = false;
	}
	for(var i in warehouseContacts){
		if (warehouseContacts[i].constructor === Array){
			numberOfArrays ++;
			if(warehouseContacts[i].length === 2){
				completedTasks[i] = true;
				numCompleted ++;
			}else{
				completedTasks[i] = false;
			}
		}
	}
	if(numberOfArrays === numCompleted){
		completedTasks.contactSetupComplete = true;
	}else{
		completedTasks.contactSetupComplete = false;
	}
	return completedTasks;
}

exports.deleteItems = function(req,cb){
    var cbCompleted = 0;
	var errOccured = false;
	var results = [];
	if (req.body.type === 'warehouse' || req.body.type === 'warehouses'){
		for(var i = 0; i<req.body.ids.length; i++){
			warehouse.deleteWarehouseById(req.body.ids[i],function(err,result){
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
		}
	}else if(req.body.type === 'warehouseSpecificContacts' || req.body.type === 'warehouseSpecificContact'){
		for(var i = 0; i<req.body.ids.length; i++){
			warehouseContacts.deleteContact(req.body.ids[i],req.body.subType,req.body.warehouseContactId,function(err,result){
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
		}
	}else if(req.body.type === 'masterContacts' || req.body.type === 'masterContact'){
		for(var i = 0; i<req.body.ids.length; i++){
			companyCtrl.deleteMasterContact(req.body.company,req.body.ids[i],function(err,result){
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
		}
	}
}

exports.getAuthorisations = function(dashboardAccessLvl){
	var auth = local.config.authorisationsByAccessLvl[dashboardAccessLvl]
	return local.config.authorisations[auth];
}