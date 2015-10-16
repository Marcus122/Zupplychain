var user = require("../controllers/users.js");
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
}

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
				cb(false,results,true);
			}
		}
	});
};