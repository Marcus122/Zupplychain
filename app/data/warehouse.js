'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	Storage = require("./storage.js"),
	local = require("../local.config.js");

var fields = {
	user: { type: Schema.ObjectId, ref: 'users' },
	name: { type: String },
	company: { type: String },
	contact: { type: String },
	addressline1: { type: String },
	addressline2: { type: String },
	addressline3: { type: String },
	county: { type: String },
	city: { type: String },
	postcode: { type: String },
	telephone: { type: String },
	mobile: { type:String },
	description: { type: String },
	height:{ type: Number },
	size: { type:Number },
	officeHours: { type:String },
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
	},
    loc  :{
        type : { type: String},
        coordinates: [Number]
    }
};

var warehouseSchema = new Schema(fields);
warehouseSchema.index({ loc: '2dsphere' });

warehouseSchema.pre('init', function(next, data) {
    next();
});

warehouseSchema.statics = {
	load: function (id, cb) {
		this.findOne({ _id : id })
		  .populate('storage')
		  .populate('user')
		  .exec(cb);
  },
  loadByUser: function(user,cb){
	 this.find({'user': user._id})
		  .populate({
			  	path:'storage',
				options:{
					sort:'sortOrder'
				}
			})
		  .populate('user')
		  .exec(cb); 
  },
  search_by_query: function(query, cb) {
    var corrResult = false;
    var editableResult = null; //stores a toObject() version of the warehouse which we can add properties to etc.
	var corrResults = [];
	
	/*if (!query.weight){
		query.weight = '0';
	}
	
	if (!query.height){
		query.height = '0';
	}*/
	
	
    this.find({
			  "loc" : {
                  $near : {
                      $geometry :  query.loc,
                      $maxDistance : query.radiusInMetres
                  }
              },
              "active": true
              }).populate({
                path : "storage"
              }).exec( function (err, result){
				  if (err){
					  console.log(err);
				  }else{
					  for(var i in result){
                          editableResult = result[i].toObject(); //turn warehouse into a nice place JS object.
						  corrResult = false;
                          for (var j=0; j<result[i].storage.length; j++){
                              var palletTypeOK  = !query.palletType || result[i].storage[j].palletType === query.palletType; //!palletType means any
                              var maxWeightOK   = !query.weight || result[i].storage[j].maxWeight >= query.weight;
                              var maxHeightOK   = !query.height || result[i].storage[j].maxHeight >= query.height;
                              var tempOK        = result[i].storage[j].temp === query.temp;
                              var spacesOK      = result[i].storage[j].palletSpaces >= query.totalPallets;
                              if (palletTypeOK && maxWeightOK && maxHeightOK && tempOK && spacesOK){
                                  corrResult = true;
                                  
                                  if (editableResult.storageMatch) {
                                      //if we already found a matching storage, only replace with this one if the price is lower
                                      var currentResultPrice = editableResult.storageMatch.currentPricing.price;
                                      var newResultPrice = editableResult.storage[j].currentPricing.price;
                                      if (currentResultPrice <= newResultPrice) {
                                          continue;
                                      }
                                  }
                                  editableResult.storageMatch = editableResult.storage[j];
                              }
                            }
						if(corrResult === true){
							corrResults.push(editableResult);
						}
					  };
					  cb(err,corrResults);
				  }
			  });
  },
  availableServices: function(){
	  return local.services;
  },
  availableSpecifications: function(){
	  return local.specifications;
  }
}

module.exports = mongoose.model('warehouses', warehouseSchema);