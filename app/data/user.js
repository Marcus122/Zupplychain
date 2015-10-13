'use strict';
var passwordHash = require('password-hash');

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	warehouse_controller = require('../controllers/warehouses');

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
	registerStatus: {type:Number}
};

var userSchema = new Schema(fields);
userSchema.index({ email:1 , type:-1 });

userSchema.methods.addWarehouse = function(data,cb){
	warehouse_controller.create_warehouse(this,data,cb);
}
userSchema.methods.getWarehouses = function(cb){
	warehouse_controller.warehouse_by_user(this,function(err,warehouses){
		cb(warehouses);
	});
}
function setPassword(password){
    return passwordHash.isHashed(password) ? password : passwordHash.generate(password);
}
function updateUsersName(name,id,cb){
	this.update({_id:id},{$set:{name:name}}).exec(cb);
}
userSchema.statics = {
	loadByEmail: function(email,cb){
		this.find({'email':email}).populate('company').exec(cb);
	}
}
module.exports = mongoose.model('users', userSchema);