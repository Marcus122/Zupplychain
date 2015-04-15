var User = require("../data/user.js"),
	local = require("../local.config.js");

exports.version = "0.1.0";


/**
 * User class.
 */
exports.create = function (req,res,data,cb) {
	//Need res to set cookie
	var user = new User(data);
	user.save(function(err){
		if (!err) {
			setCookie(user,res);
			req.data.user=user;
			return cb(null, user.toObject());
		  }else{
			 return cb(err);
		 }
	});
}
exports.register = function(user,cb){
	if(!user.email || !user.password){
		return cb({error:"required fields"});
	}
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
exports.update = function(user,cb){
	user.save(function(err){
		if(!err){
			cb(null,user);
		}else{
			cb(err);
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
	});
};
exports.user_by_email = function (email,callback) {
	User.findOne({'email':email},function(err,user){
		if(err){
			return callback(err);
		}else{
			extendUser(user);
			return callback(null,user)
		}
	});
};
function setCookie(user,res){
	res.cookie('session-id',user._id,local.cookie_config );
}