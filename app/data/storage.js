'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var fields = {
	user: { type: Schema.ObjectId, ref: 'users' },
	name: { type: String },
	palletType: { type: String },
	temp: { type: String },
	maxWeight: {type: Number },
	maxHeight: {type: Number },
	palletSpaces: {type: Number },
	pricing: [{
		from:Date,
		to:Date,
		price: Number,
		charge:Number,
		reserve:Number
	}],
	discounts:[{
		from:Number,
		to:Number,
		perc:Number
	}],
	pallets:[{
		from:Date,
		to:Date,
		total: Number,
		inUse:Number,
		free:Number
	}]
};


var storageSchema = new Schema(fields);

storageSchema.statics = {
	load: function (id, cb) {
		this.findOne({ _id : id })
		  .exec(cb);
  }
}

module.exports = mongoose.model('storage', storageSchema);