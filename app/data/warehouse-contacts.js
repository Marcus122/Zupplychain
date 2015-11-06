'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
	
var fields = {
	warehouse: { type: Schema.ObjectId, ref: 'warehouse' },
	availabilityController: [{ type: Schema.ObjectId, ref: 'users', index: { unique: true } }],
	enquiresController: [{ type: Schema.ObjectId, ref: 'users', index: { unique: true } }],
	transportCoordinator: [{ type: Schema.ObjectId, ref: 'users', index: { unique: true } }],
	goodsIn: [{ type: Schema.ObjectId, ref: 'users', index: { unique: true } }],
	pickingDispatch: [{ type: Schema.ObjectId, ref: 'users', index: { unique: true } }],
	invoiceController: [{ type: Schema.ObjectId, ref: 'users', index: { unique: true } }],
	creditController: [{ type: Schema.ObjectId, ref: 'users', index: { unique: true } }],
	contactsDeletedAt: {type: Date},
};

var warehouseContactsSchema = new Schema(fields,{ collection: 'warehouseContacts' });

warehouseContactsSchema.statics = {
	load: function (id,cb){
		this.findOne({_id:id})
		.exec(cb)
	},
	loadWarehousesContactsByACOrEC: function(userId,cb){
    	this.find({$or:[{availabilityController:{$in:[userId]}},{enquiresController:{$in:[userId]}}]}).exec(cb);
  	},
	removeByWarehouse: function(warehouse,cb){
		this.find({warehouse: warehouse}).remove().exec(cb);
	},
	loadByUser: function(userId,cb){
		this.find({$or:[{availabilityController:{$in:[userId]}},{enquiresController:{$in:[userId]}},{creditController:{$in:[userId]}},{invoiceController:{$in:[userId]}},{pickingDispatch:{$in:[userId]}},{goodsIn:{$in:[userId]}},{transportCoordinator:{$in:[userId]}}]})
		.exec(cb);
	},
	deleteWhContact: function(id,user,contactType,cb){
		// var object = {};
		// object[contactType] = user;
		// this.update({_id:id},{$pull:object}).exec(cb);
		this.findOne({_id:id},function(err,result){
			if(err){
				cb(err);
			}else{
				result[contactType].pull(user);
				if (result.contactsDeletedAt === undefined || (Date.now() - Date.parse(result.contactsDeletedAt)) > 7){
					result.contactsDeletedAt = Date.now();
				}
				result.save(function(err,result){
					cb(err,result);
				});
			}
		})
		
	},
	updateContactsdeletedAt: function(id,cb){
		this.update({_id:id},{contactsDeletedAt:Date.now()}).exec(cb);
	}
}

module.exports = mongoose.model('warehouseContacts',warehouseContactsSchema);