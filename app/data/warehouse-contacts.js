'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
	
var fields = {
	availabilityController: [{name: String,
							  email: String,
							  phoneNumber: Number,
							  dashboardAccess: Boolean}],
	enquiresController: [{name: String,
						  emails: String,
						  phoneNumber: Number,
						  dashboardAccess: Boolean}],
	transportCoordinator: [{name: String,
							email: String,
							phoneNumber: Number,
							dashboardAccess: Boolean}],
	goodsIn: [{name: String,
			   email: String,
			   phoneNumber: Number,
			   dashboardAccess: Boolean}],
	pickingDispatch: [{name: String,
					   email: String,
					   phoneNumber: Number,
					   dashboardAccess: Boolean}],
	invoiceController: [{name: String,
						 email: String,
						 phoneNumber: Number,
						 dashboardAccess: Boolean}],
	creditController: [{name: String,
						email: String,
						phoneNumber: Number,
						dashboardAccess: Boolean}]
};

var warehouseContactsSchema = new Schema(fields);

warehouseContactsSchema.statics = {
	load: function (id,cb){
		this.findOne({_id:id})
		.exec(cb)
	}
}

module.exports = mongoose.model('warehouseContacts',warehouseContactsSchema);