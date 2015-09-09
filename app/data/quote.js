'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	Storage = require("./storage.js"),
    Warehouse = require("./warehouse.js"),
    Search = require("./search.js"),
    User = require("./user.js"),
	local = require("../local.config.js"),
    AggregateStorage = require("./aggregate-storage.js"),
    Utils = require("../utils.js");

var fields = {
	user            : { type : Schema.ObjectId, ref: 'users' },
    userData        : Schema.Types.Mixed,
	warehouse       : { type : Schema.ObjectId, ref: 'warehouse' },
    search          : { type : Schema.ObjectId, ref: 'search' }, //search contains the useageProfile.
    storageProfile  : Schema.Types.Mixed,
    offerData       : Schema.Types.Mixed,
    transport       : Schema.Types.Mixed,
};

var quoteSchema = new Schema(fields);
    
// INSTANCE METHODS

quoteSchema.methods.myMethod = function() {
    ;
};

// STATIC METHODS

quoteSchema.statics = {
    
	load: function (id, cb) {
		this.findOne({ _id : id })
          .populate('search')
		  .populate('warehouse')
		  .populate('user')
          
		  .exec(cb);
  },
  loadByUser: function(user,cb){
	 this.find({'user': user._id})
          .populate('search')
		  .populate('warehouse')
		  .populate('user')
          
		  .exec(cb);
  },
  loadByWarehouse: function(warehouse,cb){
	 this.find({'warehouse': warehouse._id})
		  .populate('warehouse')
		  .populate('user')
          .populate('search')
		  .exec(cb);
  },
}

module.exports = mongoose.model('quote', quoteSchema);