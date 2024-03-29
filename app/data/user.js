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
	contact: {type:String},
	active: { type: Boolean, default: false },
	created: { type: Date , default: Date.now }
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
module.exports = mongoose.model('users', userSchema);