var user = require("../controllers/users.js");
var companyCtrl = require("../controllers/company.js");
var local = require("../local.config.js");
var warehouse = require("../controllers/warehouses.js");
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
				cb(false,data);
			});
		}
	});
}