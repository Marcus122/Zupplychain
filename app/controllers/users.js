var User = require("../data/user.js");

exports.version = "0.1.0";


/**
 * User class.
 */
exports.create_user = function (data,cb) {
	var user = new User(data);
	user.save(function(err){
		if (!err) {
			console.log("created user");
			return cb(null, user.toObject());
		  }else{
			 return cb(err);
		 }
	});
}
exports.update_user = function(user,cb){
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