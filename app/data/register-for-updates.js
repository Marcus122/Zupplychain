'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
	
var fields = {
	name: {type: String},
	email: {type:String},
	telephone: {type:Number},
	companyName: {type:String},
	requestSent: {type:Date,default: Date.now()}
};

var registerForUpdatesSchema = new Schema(fields, { collection: 'registerForUpdates' });

registerForUpdatesSchema.statics = {
	loadByRequestedDate: function (dateFrom,dateTo,cb){
		this.findOne({requestSent:{"$gte": dateFrom,"$lt":dateTo}})
		.exec(cb)
	},
}

module.exports = mongoose.model('registerForUpdates', registerForUpdatesSchema);