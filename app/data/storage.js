'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var fields = {
	name: { type: String },
	palletType: { type: String },
	temp: { type: String },
	maxWeight: {type: Number },
	maxHeight: {type: Number },
	palletSpaces: {type: Number }
};


var storageSchema = new Schema(fields);

module.exports = mongoose.model('storage', storageSchema);