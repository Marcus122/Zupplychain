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