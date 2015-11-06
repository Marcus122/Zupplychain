var User = require("../data/user.js"),
	local = require("../local.config.js"),
	passwordHash = require('password-hash'),
	company = require('../controllers/company'),
	warehouseContacts = require('../controllers/warehouse-contacts.js');

exports.version = "0.1.0";


/**
 * User class.
 */

exports.updateDashboardAccessLevel = function(user,accessLevel,cb){
	User.update({_id:user},{$push:{dashboardAccessLvl:accessLevel}}).exec(cb);	
}

exports.checkCorrectDashboardAccessLevelAndUpdate = function(user,cb){
	company.checkUserIsMaterContact(user,function(err,exists){
		if(err){
			cb(err);
		}else if(exists){
			exports.updateDashboardAccessLevel(user,local.config.dashboardAccessLevel.masterContact,function(err,result){
				if(err){
					cb(err);
				}else{
					cb(false);
				}
			});
		}else{
			warehouseContacts.getHighestDashboardAccessLevelByUser(user,function(err,dashboardAccessLevel){
				if(err){
					cb(err);
				}else{
					exports.user_by_id(user,function(err,result){
						if(err){
							cb(err);
						}else{
							if (result.dashboardAccessLvl !== dashboardAccessLevel){
								result.dashboardAccessLvl = dashboardAccessLevel;
								result.save(function(err,result){
									if(err){
										cb(err);
									}else{
										cb(false);
									}
								})
							}else{
								cb(false);
							}
						}
					});
				}
			})
		}
	});
}

exports.create = function (req,res,data,cb,cookieSet) {
	var user = new User(data);
	user.save(function(err){
		if (!err) {
			if (cookieSet === undefined || cookieSet === true){
				setCookie(user,req,res);
				req.data.user=user;
			}
			return cb(null, user.toObject());
		}else{
			 return cb(err);
		}
	});
}
exports.login = function(req,res,cb){
	var passwordIncorrect={error:"The user name or password is incorrect"};
	var locked={error:"Your account has been locked, if this persists contact us or try again later"};
	User.authenticateLoginandLogin(req.body.email,req.body.password,function(err,result,reason){
		if(result){
			setCookie(result,req,res);
			cb(null,result);
		}
		
		var reasons = User.failedLoginReason;
		switch(reason){
			case reasons.NOT_FOUND:
			case reasons.PASSWORD_INCORRECT:
				cb(passwordIncorrect);
				break;
			case reasons.MAX_ATTEMPTS:
				cb(locked);
				break;
		}
	});
}
exports.checkUserExists = function(email){
	User.findOne({email:email})
}
exports.logout = function(req,res,cb){
    console.log("logging out");
   req.session.user_id = "";
  delete req.session.user_id;
  cb(false);
}
exports.register = function(user,cb){
	if(!user.email || !user.password){
		return cb({error:"required fields"});
	}
	User.loadByEmail(user.email,function(err,results){
		if(!err && results.length > 0){
			return cb({message:"Email Address Already Exists"});
		}else{
			user.active=true;
			//Activate each warehouse
			//Dont need to wait for warehouses to update
			user.getWarehouses(function(warehouses){
				warehouses.forEach(function(warehouse){
					warehouse.active=true;
					warehouse.save();
				});
			});
			user.save(function(err){
				if(!err){	 
					cb(null);
				}else{
					cb(err);
				}
			});
		}
	});
}
exports.update = function(user,cb,dontCheckEmailAddress){
	User.loadByEmail(user.email,function(err,results){
		if(!err && results.length > 0 && (dontCheckEmailAddress === undefined || dontCheckEmailAddress === false)){
			return cb({message:"Email Address Already Exists"});
		}else{
			user.active=true;
			if(results.expiry !== undefined){
				user.expiry = results.expiry;
			}
			user.save(function(err){
				if(!err){
					cb(null,user);
				}else{
					cb(err);
				}
			});
		}
	});
}
exports.user_by_id = function (id,callback) {
	User.findById(id,function(err,user){
		if(err){
			return callback(err);
		}else{
			return callback(null,user)
		}
	}).populate('company');
};
exports.user_by_email = function (email,callback) {
	User.findOne({'email':email},function(err,user){
		if(err){
			return callback(err);
		}else{
			return callback(null,user)
		}
	});
};
function setCookie(user,req,res){
    req.session.user_id = user._id;
	//res.cookie('session-id',user._id,local.cookie_config );
};
exports.updateUsersName = function(name,id,cb){
	User.updateUsersName(name,id,function(err){
		if(err){
			cb(err);
		}else{
			cb(null)
		}
	})	
};
exports.checkOldPassword = function(password,oldPassword,cb){
	if(passwordHash.verify(oldPassword,password )){
		cb(null);
	}else{
		cb(true);
	}
};

exports.deleteUser = function(userId,cb){
	User.remove(userId,function(err,result){
		if(err){
			cb(err);
		}else{
			cb(false,result);
		}
	});
}