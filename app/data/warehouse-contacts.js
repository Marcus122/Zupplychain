'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
	
var fields = {
	warehouse: { type: Schema.ObjectId, ref: 'warehouse' },
	availabilityController: [{ type: Schema.ObjectId, ref: 'users',default: null }],
	enquiresController: [{ type: Schema.ObjectId, ref: 'users',default: null }],
	transportCoordinator: [{ type: Schema.ObjectId, ref: 'users',default: null }],
	goodsIn: [{ type: Schema.ObjectId, ref: 'users',default: null }],
	pickingDispatch: [{ type: Schema.ObjectId, ref: 'users',default: null }],
	invoiceController: [{ type: Schema.ObjectId, ref: 'users',default: null }],
	creditController: [{ type: Schema.ObjectId, ref: 'users',default: null }]
};

var warehouseContactsSchema = new Schema(fields,{ collection: 'warehouseContacts' });

warehouseContactsSchema.statics = {
	load: function (id,cb){
		this.findOne({_id:id})
		.exec(cb)
	}
}

module.exports = mongoose.model('warehouseContacts',warehouseContactsSchema);