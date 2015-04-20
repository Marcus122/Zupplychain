'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var fields = {
	storage: { type: String }, //Storage ID
	pricing: [{
		from:Date,
		to:Date,
		price: Number,
		charge:Number,
		reserve:Number
	}],
	volDiscount:[{
		from:Number,
		to:Number,
		perc:Number,
		value:Number
	}],
	pallets:[{
		from:Date,
		to:Date,
		total: Number,
		inUse:Number,
		free:Number
	}]
};


var storagePriceSchema = new Schema(fields);

module.exports = mongoose.model('storagePricing', storagePriceSchema);