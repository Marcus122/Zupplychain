'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var fields = {
	user: { type: Schema.ObjectId, ref: 'users' },
	name: { type: String },
	palletType: { type: Number },
	temp: { type: Number },
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
	return num ? Number(num).toFixed(2) : Number(0).toFixed(2);
}

function setPrice(num){
    return Number(num).toFixed(2);
}

function priceAtDate(wcDate,data) {
    var numPrices = 0;
    if (data.pricing) {
        numPrices = data.pricing.length;
    }
    for (var j = 0; j < numPrices; j++) {
        if (data.pricing[j].from <= wcDate &&
            data.pricing[j].to > wcDate) {
            return data.pricing[j];
        }
    }
    return data.basicPricing;
}

function spacesAtDate(wcDate, data){
    var currentPalletsAvailable = data.palletSpaces;
    var numPalletEntries = 0;
    if (data.pallets) {
        numPalletEntries = data.pallets.length;
    }
    for (var j =0;j < numPalletEntries; j++) {
        if (data.pallets[j].from <= wcDate &&
        data.pallets[j].to > wcDate) {
            currentPalletsAvailable = data.currentPalletsAvailable - data.pallets[j].inUse;
        }
    }
    return currentPalletsAvailable;
}

var storageSchema = new Schema(fields);

storageSchema.methods.getPriceAtDate = function(wcDate){
    return priceAtDate(wcDate, this);
}

storageSchema.methods.getFreeSpacesAtDate = function(wcDate){
    return spacesAtDate(wcDatem, this);
}

storageSchema.pre('init', function(next, data) {
    
    //This lot is just setting the prices to 2 d.p., also Null values converted to 0 
    var fieldsToConvert = ['price', 'reserve', 'charge'];
    var lim = fieldsToConvert.length;
    var numPrices = 0;
    var numPalletEntries =0;
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

    var currentDate = new Date();
    data.currentPricing = priceAtDate(currentDate, data);    
    data.currenPalletsAvailable = spacesAtDate(currentDate, data);
    next();
});

storageSchema.statics = {
	load: function (id, cb) {
		this.findOne({ _id : id })
		  .exec(cb);
    }
}

module.exports = mongoose.model('storage', storageSchema);