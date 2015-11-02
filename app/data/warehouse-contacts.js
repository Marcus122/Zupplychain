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
	creditController: [{ type: Schema.ObjectId, ref: 'users', index: { unique: true } }]
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
	}
}

module.exports = mongoose.model('warehouseContacts',warehouseContactsSchema);