'use strict';
var passwordHash = require('password-hash');

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	warehouse_controller = require('../controllers/warehouses'),
	bcrypt = require('bcryptjs');

var fields = {
	email: { type: String },
	password: {type:String, set:setPassword },
	name: {type:String},
	active: { type: Boolean, default: false },
	created: { type: Date , default: Date.now },
	expiry: { type: Date , default: new Date(+new Date + 12096e5) },
	type: {type: Number},
	phoneNumber: {type:String},
	company: { type: Schema.ObjectId, ref: 'company' },
	dashboardAccess: {type:String},
	registerStatus: {type:Number},
	dashboardAccessLvl: {type:Number},
	loginAttempts:{ type: Number, required: true, default: 0},
	lockUntil: {type:Number}
};

var userSchema = new Schema(fields);
userSchema.index({ email:1 , type:-1 });
var reasons = userSchema.statics.failedLoginReason = {
	NOT_FOUND:0,
	PASSWORD_INCORRECT:1,
	MAX_ATTEMPTS:2
};
userSchema.virtual('isLocked').get(function(){
	//check for a future lockUntil timestamp
	return !!(this.lockUntil && this.lockUntil > Date.now());
});
userSchema.methods.incrLoginAttempts = function(cb){
	if(this.lockUntil && this.lockUntil < Date.now()){
		return this.update({
			$set:{loginAttemps: 1},
			$unset:{lockUntil:1}
		},cb);
	}
	
	var updates = {$inc: {loginAttempts:1}};
	if (this.loginAttempts +1 >= 3 && !this.isLocked){
		updates.$set = {lockUntil: Date.now() + 2*60*60*1000}
	}
	
	return this.update(updates,cb);
}
userSchema.methods.addWarehouse = function(data,cb){
	warehouse_controller.create_warehouse(this,data,cb);
}
userSchema.methods.getWarehouses = function(cb){
	warehouse_controller.warehouse_by_user(this,function(err,warehouses){
		cb(warehouses);
	});
}
function setPassword(password){
    //return passwordHash.isHashed(password) ? password : passwordHash.generate(password);
	//var user = this;
	//if (!user.isModified('password')) return password;
	
	var salt = bcrypt.genSaltSync(10);
	return bcrypt.hashSync(password,salt);
}
function updateUsersName(name,id,cb){
	this.update({_id:id},{$set:{name:name}}).exec(cb);
}
function authenticatePassword(password,storedPassword,cb){
	bcrypt.compare(password,storedPassword,function(err,match){
		if(err) return cb(err);
		cb(null,match);
	})
}
userSchema.statics = {
	loadByEmail: function(email,cb){
		this.find({'email':email}).populate('company').exec(cb);
	},
	remove: function(id,cb){
		this.findOne({_id:id}).remove().exec(cb);
	},
	failedLoginReason:{
		NOT_FOUND: reasons.NOT_FOUND,
		PASSWORD_INCORRECT: reasons.PASSWORD_INCORRECT,
		MAX_ATTEMPTS: reasons.MAX_ATTEMPTS
	},
	authenticateLoginandLogin: function(username,password,cb){
		this.findOne({'email':username},function(err,user){
			if(err) return cb(err);
			
			if(!user){
				return cb(null,null,reasons.NOT_FOUND);
			}
			
			if(user.isLocked){
				return user.incrLoginAttempts(function(err){
					if(err) return cb(err);
					return cb(null,null,reasons.MAX_ATTEMPTS);
				});
			}
			
			authenticatePassword(password,user.password,function(err,match){
				if(err) return cb(err);
				
				if(match){
					if(!user.loginAttempts && !user.lockUntil) return cb(null,user);
					
					var updates = {
						$set: {loginAttempts:0},
						$unset: {lockUntil:1}
					}
					
						return user.update(updates,function(err){
							if(err) return cb(err);
							return cb(null,user);
						});
				}
				user.incrLoginAttempts(function(err){
					if(err) return cb(err);
					return cb(null,null,reasons.PASSWORD_INCORRECT)
				});
			});

		}).populate('company');
	}
}
module.exports = mongoose.model('users', userSchema);