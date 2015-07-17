'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	local = require("../local.config.js");

var fields = {
    user: { type: Schema.ObjectId, ref: 'users' },
    palletType : {type: Number},
    totalPallets : {type: Number},
    desription : {type : String},
    postcode : {type : String},
    maxDistance : {type : Number },
    height : {type : Number},
    weight : {type : Number},
    temp : {type : Number},
    startDate : {type : Date},
    minDuration : {type : Number},
    created_at : { type: Date },
    updated_at : { type: Date }
};

var searchSchema = new Schema(fields);
searchSchema.index({ loc: '2dsphere' });

searchSchema.pre('save', function(next){
  var now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});


searchSchema.statics = {
    load: function (id, cb) {
		this.findOne({ _id : id })
		  .exec(cb);
    },
    loadMostRecentForUser : function(user,cb){
        this.findOne({'user': user._id})
            .sort("-created_at")
            .exec(cb); 
    },
}

module.exports = mongoose.model('searches', searchSchema);