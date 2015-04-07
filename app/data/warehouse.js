'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var fields = {
	customer: { type: String }, //Customer ID
	name: { type: String },
	description: { type: String },
	services: [{name:String, active: Boolean}],
	specifications: [{name:String, active: Boolean}],
	photos: [{filename:String}],
	documents: [{filename:String, type:String}],
	active: { type: Boolean, default: true },
	created: { type: Date , default: Date.now } 
};

var warehouseSchema = new Schema(fields);

module.exports = mongoose.model('warehouses', warehouseSchema);