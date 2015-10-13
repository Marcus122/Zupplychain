var warehouses = require("../controllers/warehouses.js");
var companyCtrl = require("../controllers/company.js");
var warehouseContacts = require("../controllers/warehouse-contacts.js");
var users = require("../controllers/users.js");
var dashboard = require("../controllers/dashboard.js");
var local = require("../local.config.js");
var path = require('path');
var emailer = require("../controllers/emailer.js")

var handler = function(app) {
	app.param('warehouse_id', warehouses.load);
	
	app.get('/dashboard', checkForLogon, function(req,res){
		companyCtrl.warehouseByCompany(req.data.user.toObject().company,function(err,warehouses){
			if (err){
				setErrorResponse("Warehouse not found",res);
			}else{
				companyCtrl.getMasterContactsUserData(req.data.user.toObject().company,function(err,masterContacts){
					req.data.warehouses = warehouses;
					req.data.masterContacts = masterContacts;
					req.data.temperatures = local.config.temperatures;
					req.data.services = local.config.services;
					req.data.palletTypes = local.config.palletTypes;
					req.data.specifications = local.config.specifications;
					res.render("dashboard",req.data);
				});
			}
		})
	});
	
	app.post('/update-contacts', function(req,res){
		warehouses.load(req,res,function(err,warehouse){
			if (!err){
				warehouseContacts.createWarehouseContacts(warehouse,req.body.masterContacts,req.bosy.contacts,function(err){
					if(!err){
						setResponse('Contacts Saved',res);
					}else{
						setResponseWithErr("Contacts not saved",res);
					}
				})
			}else{
				setResponseWithErr('Warehouse Not Found',res);
			}
		},req.body['warehouse-id']);
	});
	
	app.get('/get-warehouse-contacts/:warehouse_id',function(req,res){
		res.render('partials/dashboard/warehouse-specific-contacts',req.warehouse);
	});
	
	app.post('/save-account-details',function(req,res){
		saveAccountDetails(req,function(err){
			if(err){
				setResponseWithErr('An error occurred while attempting to change your details',res);
			}else{
				setResponse({message:'Details changed successfully',email:req.body.email},res);
			}
		});
	});
	
	app.post('/change-password', checkOldPassword,function(req,res){
		changePassword(req,function(err){
			if(err){
				setResponseWithErr('An error occurred while attempting to change your details',res);
			}else{
				setResponse({successMessage:'Details changed successfully'},res);
			}
		})
	});
	
	app.get('/view-edit-warehouse/:warehouse_id',function(req,res){
		req.data.warehouse = req.warehouse;
		req.data.services = local.config.services;
		req.data.specifications = local.config.specifications;
		req.data.palletTypes = local.config.palletTypes;
		req.data.temperatures = local.config.temperatures;
        res.render('partials/dashboard/view-edit-warehouse',req.data);
	});
	
	app.get('/add-new-warehouse',function(req,res){
		warehouses.warehouse_by_user(req.data.user,function(err,warehouses){
			if(err){
				setErrorResponse("Warehouse not found",res);
			}else{
				req.data.temperatures = local.config.temperatures;
				req.data.services = local.config.services;
				req.data.palletTypes = local.config.palletTypes;
				req.data.specifications = local.config.specifications;
				req.data.warehouse = {};
				req.data.warehouse.company = warehouses[0].company;
				req.data.warehouse.photos = [];
				req.data.warehouse.documents = [];
				req.data.warehouse.storage = [];
				res.render('partials/dashboard/view-edit-warehouse',req.data);
			}
		});
	});
	
	app.post('/create-contact',function(req,res){
		createContact(req,res,function(err){
			if(err){
				setResponseWithErr('Error: Contact not created',res);
			}else{
				setResponse('Contact Created',res)
			}
		});
	});
	
	app.get('/rebuild-pricing-and-availability/:warehouse_id',function(req,res){
		req.data.warehouse = req.warehouse;
		res.render('partials/dashboard/registration-3',req.data);
	});
	
	app.get('/rebuild-warehouse-list/:warehouse_id',function(req,res){
		req.data.warehouse = req.warehouse;
		res.render('partials/dashboard/warehouses',req.data);
	});
	
};

function changePassword(req,cb){
	dashboard.changePassword(req.data.user,req.body['new-password'],function(err){
		if(err){
			cb(err);
		}else{
			cb(null);
		}
	});
}

function checkOldPassword(req,res,next){
	users.checkOldPassword(req.data.user.password,req.body['old-password'],function(err){
		if(err){
			setResponseWithErr('Your old password does not match',res);
		}else{
			next();
		}
	})
}

function getWarehousesByUser(user,cb){
	warehouses.warehouse_by_user(user,function(err,warehouses){
		if (!err){
			cb(null,warehouses);
		}else{
			cb(err);
		}
	});
}

function saveAccountDetails(req,cb){
	getWarehousesByUser(req.data.user,function(err,warehouses){
		if(err){
			cb(err);
		}else{
			dashboard.saveBasicAccountDetails(req.body.name,req.body.email,req.body['company-name'],req.body["phone-number"],req.data.user,warehouses[0],function(err){
				if(err){
					cb(err);
				}else{
					cb(null);
				}
			});
		}
	})
}

function createContact(req,res,cb){
	var data = {},
		tableId,
		cntr;
	data.email = req.body.email;
	data.type = 1//hard coded for now
	data.name = req.body.name;
	data.active = false;
	data.phoneNumber = req.body.phoneNumber;
	data.dashboardAccess = req.body.dashboardAccess;
	data.registerStautus = 0;
	data.company = req.data.user.company;
	users.create(req,res,data,function(err,user){
		if(err){
			cb(err);
		}else{
			if (req.body.role == 'Master Contacts'){
				tableId = req.data.user.company._id;
				cntr = companyCtrl;
			}else{
				tableId = req.body.warehouseContacts;
				cntr = warehouseContacts;
			}
			cntr['update' + req.body.role.replace(/\s/g, '')](tableId,user._id,function(err,result){
				var emailContactData = {};
				emailContactData.title = 'Complete Registration';
				emailContactData.subtitle = 'Complete Registration';
				emailContactData.referer = req.data.user.name;
				emailContactData.role = req.body.role;
				emailContactData.company = req.data.user.company.name;
				emailContactData.link = req.protocol + '://' + req.headers.host + '/initial-registration/' + user._id.toString();
				emailContactData.warehouse = "";
				emailContactData.config = local.config;
				res.render('emails/create-contact',emailContactData,function(err,template){
					if(err){
						cb(err);
						//Delete the created user
					}else{
						emailer.sendMail(req,res,template,req.body.email,'info@zupplychain.com','Complete Registration',function(err){
							cb(null);
						});
					}
				});
			});
		}
	},false)
}

function checkForLogon(req,res,next){
	if(req.data.user.active) return next();
	res.redirect('/');
}

function setResponse(data,res){
	res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: false, data: data };
    res.end(JSON.stringify(output) + "\n");
}

function setResponseWithErr(message,res){
	res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: true, data: message };
    res.end(JSON.stringify(output) + "\n");
}

function setErrorResponse(err,res){
	res.writeHead(500, {"Content-Type": "application/json"});
    var output = { error: true, data: err };
    res.end(JSON.stringify(output) + "\n");
}

module.exports = handler;