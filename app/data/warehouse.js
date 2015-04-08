'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var fields = {
	customer: { type: String }, //Customer ID
	name: { type: String },
	email: { type: String },
	addressline1: { type: String },
	addressline2: { type: String },
	city: { type: String },
	postcode: { type: String },
	description: { type: String },
	telephone: { type: String },
	mobile: { type:String },
	description: { type: String },
	services: [{name:String, active: Boolean}],
	specifications: [{name:String, active: Boolean}],
	photos: [{filename:String}],
	documents: [{filename:String, type:String}],
	active: { type: Boolean, default: false },
	created: { type: Date , default: Date.now } 
};

var warehouseSchema = new Schema(fields);

module.exports = mongoose.model('warehouses', warehouseSchema);