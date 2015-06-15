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
	noDiscount:{type: Number },
	basicPricing:{
		price: { type: Number, default:0, get:getPrice, set:setPrice },
		charge:{ type: Number, default:0, get:getPrice, set:setPrice },
		reserve:{ type: Number, default:0, get:getPrice, set:setPrice }
	},
	pricing: [{
		from:Date,
		to:Date,
		price: { type: Number, default:0, set:setPrice, get:getPrice },
		charge:{ type: Number, default:0, get:getPrice, set:setPrice },
		reserve:{ type: Number, default:0, get:getPrice, set:setPrice }
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
function getPrice(num){
	console.log("getPrice");
	return num ? Number(num).toFixed(2) : Number(0).toFixed(2);
}
function setPrice(num){
    return Number(num).toFixed(2);
}

var storageSchema = new Schema(fields);


storageSchema.pre('init', function(next, data) {
    
    //This lot is just setting the prices to 2 d.p., also Null values converted to 0 
    var fieldsToConvert = ['price', 'reserve', 'charge'];
    var lim = fieldsToConvert.length;
    var numPrices = 0;
    if (data.pricing) {
        numPrices = data.pricing.length;
    }
    for (var i = 0; i < lim;i++) {
        if (data.basicPricing) {
            if(data.basicPricing[fieldsToConvert[i]]) {
                data.basicPricing[fieldsToConvert[i]] = data.basicPricing[fieldsToConvert[i]].toFixed(2);
            } else {
                data.basicPricing[fieldsToConvert[i]] = Number(0).toFixed(2);
            }
        }
        for (var j = 0; j < numPrices; j++) {
            if (data.pricing[j][fieldsToConvert[i]] != null) {
                data.pricing[j][fieldsToConvert[i]] = data.pricing[j][fieldsToConvert[i]].toFixed(2);
            } else {
                data.pricing[j][fieldsToConvert[i]] = Number(0).toFixed(2);
            }
        }
    }
    
    //loop through again, pull out the current price and store in .currentPricing.
    data.currentPricing = data.basicPricing; //fallback if no date range match.
    var currentDate = new Date();
    for (var j = 0; j < numPrices; j++) {
            if (data.pricing[j].from < currentDate &&
                data.pricing[j].to > currentDate) {
                data.currentPricing = data.pricing[j];
            }
        }
    next();
});

storageSchema.statics = {
	load: function (id, cb) {
		this.findOne({ _id : id })
		  .exec(cb);
  }
}

module.exports = mongoose.model('storage', storageSchema);