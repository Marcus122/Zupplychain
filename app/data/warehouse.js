'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	Storage = require("./storage.js");

var fields = {
	user: {  type : String }, //User ID
	name: { type: String },
	email: { type: String },
	contact: { type: String },
	addressline1: { type: String },
	addressline2: { type: String },
	city: { type: String },
	postcode: { type: String },
	telephone: { type: String },
	mobile: { type:String },
	description: { type: String },
	services: [{name:String, active: Boolean}],
	specifications: [{name:String, active: Boolean}],
	photos: [{filename:String}],
	documents: [{filename:String, type:String}],
	active: { type: Boolean, default: false },
	created: { type: Date , default: Date.now },
	storage: [{ type: Schema.ObjectId, ref: 'storage' }]
};

var warehouseSchema = new Schema(fields);

warehouseSchema.statics = {
	load: function (id, cb) {
		this.findOne({ _id : id })
		  .populate('storage')
		  .exec(cb);
  },
  loadByUser: function(user,cb){
	 this.find({'user': user._id})
		  .populate('storage')
		  .exec(cb); 
  }
}

module.exports = mongoose.model('warehouses', warehouseSchema);