'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var fields = {
	name: { type: String },
	email: { type: String },
	addressline1: { type: String },
	addressline2: { type: String },
	city: { type: String },
	postcode: { type: String },
	description: { type: String },
	active: { type: Boolean },
	created: { type: Date , default: Date.now } 
};

var userSchema = new Schema(fields);
userSchema.index({ email:1 , type:-1 });

module.exports = mongoose.model('user', userSchema);