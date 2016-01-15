var User = require("../controllers/users.js"),
	local = require("../local.config.js"),
	multiparty = require('multiparty'),
	utils = require('../utils.js'),
	fs = require('fs'),
	emailer = require('../controllers/emailer.js'),
    company = require('../controllers/company.js');

var handler = function(app) {
	app.get('/provider-registration', function(req,res){
		res.render("registration",req.data);
	});
	app.get('/customer', function(req,res){
		res.render("search-landing",req.data);
	});
	app.get('/registration-complete', function(req,res){
		res.render("registration-complete",req.data);
	});
	app.get('/provider-registration/:step', populateData, registrationHandler);
	app.get('/provider-registration-:step', populateData, registrationHandler);
	app.post('/provider-registration-:step', registrationHandler);
	app.post('/complete-registration',completeRegistration);
	app.post('/save-registration',saveRegistration);
	app.post('/registration/upload',uploadFile,fileOutput);
	app.get('/initial-registration/:userId',function(req,res){
		User.user_by_id(req.params.userId,function(err,user){
			if(err){
				setErrorResponse('Oops someting went wrong',res)
			}else{
				if (user.expiry !== null && user.expiry >= Date.now()){
					req.data.user = user;
					res.render('initial-registration',req.data);
				}else{
					res.status(404).render('404', req.data);
				}
			}
		});
	});
	app.post('/register-contact/:userId',registerContact);
    app.get('/provider-register',function(req,res){
       if(!req.data.user._id){
            res.render("provider-simple-registration",req.data); 
       }else{
           res.redirect('/dashboard');
       }
    });
};
function sendRegisteredEmail(req,res,emailData,cb){
	emailData.title = 'Registration Complete';
	emailData.subtitle = 'Registration Complete';
	emailData.config = local.config;
	res.render('emails/registered',emailData,function(err,template){
		if(err){
			console.log(err);
			cb(err);
		}else{
			emailer.sendMail(req,res,template,emailData.email,'info@zupplychain.com','Registration Complete',function(err){
				cb(null);
			});
		}
	});
}

function registerContact(req,res){
	User.user_by_id(req.params.userId,function(err,user){
		if(err){
			setErrorResponse('Oops someting went wrong',res)
		}else{
			user.name = req.body.name;
			user.email = req.body.email;
			user.phoneNumber = req.body['phone-number'];
			user.password = req.body.password;
			user.active = true;
			user.expiry = null;
			User.update(user,function(err,user){
				if(err && err.message !== "Email Address Already Exists"){
					setErrorResponse('Oops someting went wrong',res)
				}else{
					var emailData = {};
					emailData.email = req.body.email;
					emailData.loginUrl = req.protocol + '://' + req.headers.host + '/login';
					sendRegisteredEmail(req,res,emailData,function(){
						User.login(req,res,function(err,user){
							res.writeHead(200, {"Content-Type": "application/json"});
							var output = {redirectUrl: '/dashboard'};
							res.end(JSON.stringify(output) + "\n");
						});
					});
				}
			},true);
		}
	});
}
function registrationHandler(req,res){
	//If active send to dashboard
		// if(req.data.user.active){ //disabled while we test stuff.
		// 	res.redirect('/dashboard');
		// }
		// else if(req.params.step > 1 && !req.data.user._id ){
		// 	redirectToStart(res);
		// }else if (req.data.user._id && req.idsMatch === false){
		// 	res.redirect('/logout');
		// }else{
		// 	res.render("registration" + "-" + req.params.step,req.data);
		// }
        if(!req.data.user._id){
            res.redirect('/provider-register');
        }else if (req.data.user._id && req.data.user.warehouses && req.data.user.warehouses.length === 0){
            res.render("registration" + "-" + req.params.step,req.data);
        }else{
            res.redirect('/dashboard');
        }
}
function populateData(req,res, next){
    req.data.temperatures = local.config.temperatures;
	req.data.services = local.config.services;
    req.data.palletTypes = local.config.palletTypes;
	req.data.specifications = local.config.specifications;
	if(!req.data.user._id) return next();
	req.data.user.getWarehouses(function(warehouses){
		req.idsMatch = utils.checkUserSameAgainstLoadedWarehouse(warehouses[0],req.data.user);
		req.data.user.warehouses = warehouses;
		return next();
	});
}
function completeRegistration(req,res){
    var newCompany = {};
	//if(!req.data.user._id) return redirectToStart(res);
	req.data.user.email = req.body.email;
	req.data.user.password = req.body.password;
	req.data.user.contact = req.body.contact;
	req.data.user.name = req.body.name;
	req.data.user.type = req.body["user-type"];
    req.data.user.phoneNumber = req.body["phone-number"];
	req.data.user.expiry = null;//This user is now completing their registration, so there is no need for an expiry date
	req.data.user.dashboardAccessLvl = req.body["dashboard-access-level"]
    req.data.user.active = true;
    User.create(req,res,req.data.user,function(err,newUser){
		if(err){
			//var backURL=req.header('Referer') 
		    //return backURL ? res.redirect(backURL) : redirectToStart(res);
			res.writeHead(200, {"Content-Type": "application/json"});
			res.end(JSON.stringify(err));
			return;
		}else{
            newCompany.name = req.body["company-name"];
            newCompany.phoneNumber = req.body["company-phone-number"];
            newCompany.website = req.body.website;
            newCompany.warehouses = [];
            if(newCompany.name){
                company.create(req,res,newCompany,function(err,newCompany){
                    if(err){
                        res.writeHead(200, {"Content-Type": "application/json"});
                        res.end(JSON.stringify(err));
                        return; 
                    }else{
                        company.updateMasterContacts(newCompany._id,newUser._id,function(err,result){
                            if(err){
                                res.writeHead(200, {"Content-Type": "application/json"});
                                res.end(JSON.stringify(err));
                                return; 
                            }else{
                                newUser.company = result._id;
                                User.updateCompany(newUser._id,newCompany._id,function(err,result){
                                    if(err){
                                        res.writeHead(200, {"Content-Type": "application/json"});
                                        res.end(JSON.stringify(err));
                                        return; 
                                    }else{
                                        var emailData = {};
                                        emailData.email = req.body.email;
                                        emailData.loginUrl = req.protocol + '://' + req.headers.host + '/login';
                                        sendRegisteredEmail(req,res,emailData,function(){
                                            res.send({redirect: '/registration-complete'});
                                        });
                                    }
                                })
                            }
                        },1)
                    }
                });
            }else{
                var emailData = {};
                emailData.email = req.body.email;
                emailData.loginUrl = req.protocol + '://' + req.headers.host + '/login';
                sendRegisteredEmail(req,res,emailData,function(){
                    res.send({redirect: '/registration-complete'});
                });
            }
		}
	},true);
}
function saveRegistration(req,res){
	//if(!req.data.user._id) return redirectToStart(res);
	if(!req.body.email || !req.body.email){
		res.writeHead(200, {"Content-Type": "application/json"});
		res.end(JSON.stringify({error:"required fields"}));
		return;
	}
	req.data.user.email = req.body.email;
	req.data.user.password = req.body.password;
	req.data.user.type = req.body["user-type"];
	req.data.user.expiry = null;//This user is now completing their registration, so there is no need for an expiry date
	User.update(req.data.user,function(err){
		res.writeHead(200, {"Content-Type": "application/json"});
		if(err){
			res.end(JSON.stringify(err));
		}else{
			var emailData = {};
			emailData.email = req.body.email;
			emailData.loginUrl = req.protocol + '://' + req.headers.host + '/login';
			sendRegisteredEmail(req,res,emailData,function(){
				res.end(JSON.stringify({error:false}));
			});
		}
	});
}
function uploadFile(req,res,next){
	var form = new multiparty.Form();
	 form.parse(req, function(err, fields, files) {
		req.files = files[0];
		req.fields = fields;
		 for(var i in files[0] ){
		 	fs.mkdir(local.config.upload_folders[2],function(err){
		 		if(err){
		 			if(err.code === 'EEXIST'){}
		 		}
				//var parts = files[0][i].originalFilename.split('.');
				//files[0][i].originalFilename = parts[0] + '-' + Math.floor(new Date() / 1000) + '.' + parts[1];
		 		fs.rename(files[0][i].path, local.config.upload_folders[2] + files[0][i].originalFilename);//Temporary folder until it is uploaded correctly
		 		next();
			});
		//fs.rename(files[0][i].path, local.config.upload_folders[1] + files[0][i].originalFilename);
		//next();
		}
    });
}
function redirectToStart(res){
	res.redirect('/provider-registration-1');
}
function fileOutput(req,res){
	var files=[];
	res.writeHead(200, {"Content-Type": "application/json"});
	for(var i in req.files){
		var file={};
		file.name = req.files[i].originalFilename;
		files.push(file);
	}
	res.end(JSON.stringify(files));
}
function setResponse(req,res){
	res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: null, data: req.warehouse.toObject({
		versionKey:false
	}) };
    res.end(JSON.stringify(output) + "\n");
}
function setErrorResponse(err,res){
	res.writeHead(500, {"Content-Type": "application/json"});
    var output = { error: true, data: err };
    res.end(JSON.stringify(output) + "\n");
}
module.exports = handler;