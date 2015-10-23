'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
	
var fields = {
	name: {type: String},
	warehouses: [Schema.Types.Mixed],
	masterContacts: [Schema.Types.Mixed]
};

var companySchema = new Schema(fields, { collection: 'company' });

companySchema.statics = {
	load: function (id,cb){
		this.findOne({_id:id})
		.exec(cb)
	},
	loadByUser: function(user,cb){
		this.find({masterContacts:{$in:[user]}})
		.exec(cb)
	},
	removeMasterContact: function(id,user,cb){
		this.update({_id:id},{$pull:{masterContacts:{$in:[user]}}}).exec(cb);
	}
}

module.exports = mongoose.model('company', companySchema);