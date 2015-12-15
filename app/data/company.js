'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
	
var fields = {
	name: {type: String},
	warehouses: [Schema.Types.Mixed],
	masterContacts: [Schema.Types.Mixed],
	contactsReminderSent: {type: Boolean},
	created:{type:Date,default:Date.now()},
	masterContactsDeletedAt: {type: Date}
};

var companySchema = new Schema(fields, { collection: 'company' });

companySchema.statics = {
	load: function (id,cb){
		this.findOne({_id:id})
		.exec(cb)
	},
	loadByUser: function(user,cb){
		this.find({"masterContacts.user":mongoose.Types.ObjectId(user)})
		.exec(cb)
	},
	removeMasterContact: function(id,user,cb){
		//this.update({_id:id},{$pull:{masterContacts:{$in:[user]}}}).exec(cb);
		this.findOne({_id:id},function(err,result){
			var deletedCounter = 0;
			var deleteIndexes = [];
			if(err){
				cb(err);
			}else{
				result.masterContacts.forEach(function(element,index){
					if (element['user'].equals(mongoose.Types.ObjectId(user))){
						//result.splice(index,1);
						deleteIndexes.push(index);
						deletedCounter ++;
					}else{
						result.masterContacts[index]['sortOrder'] -= deletedCounter;
					}
				});
				for (var i = 0; i<deleteIndexes.length; i++){
					result.masterContacts.splice(deleteIndexes[i],1);
				}
				if (result.contactsDeletedAt === undefined || (Date.now() - Date.parse(result.contactsDeletedAt)) > 7){
					result.masterContactsDeletedAt = Date.now();
				}
				result.save(function(err,result){
					cb(err,result);
				});
			}
		})
	},
	updateContactsReminderSent: function(id,contactsReminderSent,cb){
		this.update({_id:id},{$set:{contactsReminderSent:contactsReminderSent}}).exec(cb);
	},
	loadAllCompanies: function(cb){
		this.find({})
		.exec(cb);
	}
}

module.exports = mongoose.model('company', companySchema);