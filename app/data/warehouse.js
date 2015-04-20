'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	Storage = require("./storage.js"),
	local = require("../local.config.js");

var fields = {
	user: { type: Schema.ObjectId, ref: 'users' },
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
	services: [String],
	specifications: [String],
	photos: [String],
	documents: [{filename:String, type:String}],
	active: { type: Boolean, default: false },
	created: { type: Date , default: Date.now },
	storage: [{ type: Schema.ObjectId, ref: 'storage' }],
	geo: {
		lat: { type: Number },
		lng: { type: Number }
	}
};

var warehouseSchema = new Schema(fields);

warehouseSchema.statics = {
	load: function (id, cb) {
		this.findOne({ _id : id })
		  .populate('storage')
		  .populate('user')
		  .exec(cb);
  },
  loadByUser: function(user,cb){
	 this.find({'user': user._id})
		  .populate('storage')
		  .populate('user')
		  .exec(cb); 
  },
  search_by_query: function(query, cb) {
      
    this.find({
              "geo.lat":{ $gte:(query.geo.lat -80), $lte:(query.geo.lat + 80)},
              "geo.lng":{ $gte:(query.geo.lng -80), $lte:(query.geo.lng + 80)},
              "active": true
              },
              function(err,result){
                  console.log("in Warehouse.js got query result:")
                  console.log(query.palletType);
                  console.log(err);
                  console.log(result);
              }).populate({ path : "storage", match : {palletType : query.palletType} }).exec(cb);
  },
  availableServices: function(){
	  return local.services;
  },
  availableSpecifications: function(){
	  return local.specifications;
  }
}

module.exports = mongoose.model('warehouses', warehouseSchema);