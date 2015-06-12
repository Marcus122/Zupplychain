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
	sortOrder:{type: Number },
	pricing: [{
		from:Date,
		to:Date,
		price: { type: Number, set:setPrice },
		charge:{ type: Number, default:0 },
		reserve:{ type: Number, default:0 }
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
function setPrice(num){
    return Number(num).toFixed(2);
}

var storageSchema = new Schema(fields);

storageSchema.statics = {
	load: function (id, cb) {
		this.findOne({ _id : id })
		  .exec(cb);
  }
}

module.exports = mongoose.model('storage', storageSchema);