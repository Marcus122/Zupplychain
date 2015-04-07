'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	warehouse_controller = require('../controllers/warehouse');

var fields = {
	name: { type: String },
	email: { type: String },
	addressline1: { type: String },
	addressline2: { type: String },
	city: { type: String },
	postcode: { type: String },
	description: { type: String },
	telephone: { type: String },
	mobile: { type:String },
	active: { type: Boolean, default: true },
	created: { type: Date , default: Date.now } 
};

var userSchema = new Schema(fields);
userSchema.index({ email:1 , type:-1 });

userSchema.methods.addWarehouse = function(data,cb){
	warehouse_controller.create_warehouse(this,data,cb);
}

module.exports = mongoose.model('users', userSchema);