'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
	
var fields = {
	emailType:{type:Number},
	contactType:{type:String},
	content:{type:String}
}

var schema = new Schema(fields, { collection: 'contactsEmailContent' });

schema.statics = {
	loadByEmailTypeAndContactType: function(emailType,contactType,cb){
		this.findOne({emailType:emailType,contactType:contactType})
		.exec(cb)
	}
}

module.exports = mongoose.model('contactsEmailContent', schema);