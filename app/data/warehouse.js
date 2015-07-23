'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	Storage = require("./storage.js"),
	local = require("../local.config.js"),
    AggregateStorage = require("./aggregate-storage.js");

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

warehouseSchema.methods.generateStorageProfile = function(query) {
    var warehouseAPI = this;
    //grab the warehouse storages,
    var storages = this.storage;
    var aggStorage = this.constructor.storagesToAggregateStorage(storages, query);
    this.storageProfile = aggStorage.generateContractStorageProfile(query.useageProfile);
    this.useageProfile = query.useageProfile;
};

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
  
  //TODO: this should no longer be used anywhere.. check and delete.
  /*getStorageProfile: function(query, warehouseId, cb) {
    var warehouseAPI = this;
    this.findOne({ _id : warehouseId})
        .populate({
			  	path:'storage',
				options:{
					sort:'sortOrder'
				}
			})
            .exec(function(err, result) {
                if (err) {
                    console.log(err);
                    cb (err);
                } else {
                    var warehouseResult = warehouseAPI.checkAgainstQueryAndPopulate(result, query);
                    cb(false, warehouseResult);
                }
            });
  },*/
  
  storagesToAggregateStorage: function(storage, query) {     
    query.palletType   = parseInt(query.palletType,10);
    query.temp         = parseInt(query.temp,10);
    query.totalPallets = parseInt(query.totalPallets,10);
    var matchingStorages = [];
    var k = 0;
    for (var j=0; j<storage.length; j++){
        var palletTypeOK  = !query.palletType || storage[j].palletType == 0 || storage[j].palletType === query.palletType; //!palletType means any
        var maxWeightOK   = !query.weight || storage[j].maxWeight >= query.weight;
        var maxHeightOK   = !query.height || storage[j].maxHeight >= query.height;
        var tempOK        = storage[j].temp === query.temp;
        
        if (palletTypeOK && maxWeightOK && maxHeightOK && tempOK) {
            matchingStorages.push(storage[j]);
        }
    }
    if (matchingStorages.length == 0) {
        return false;
    }
    var aggStorage = new AggregateStorage(matchingStorages);
    return aggStorage;
  },
  
  
  
  search_by_query: function(query, cb) {
    var warehouseAPI = this;
    var editableResult = null; //stores a toObject() version of the warehouse which we can add properties to etc.
	var corrResults = [];   
	
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
                            var warehouseResult = warehouseAPI.checkAgainstQueryAndPopulate(result[i], query);
                            if (warehouseResult) {
                                corrResults.push(warehouseResult);
                            }
                        }
                      corrResults.sort(function(a,b) {
                          return a.distanceFromSearch-b.distanceFromSearch;
                      });
					  cb(err,corrResults) ;
				  }
			  });
  },
  
  checkAgainstQueryAndPopulate: function(warehouse, query) {
        function distanceInMiles(point1, point2) {
            function toRadians(degrees) { return degrees * Math.PI / 180; }
            var lat1 = point1.lat, lat2 = point2.lat, lon1 = point1.lng, lon2 = point2.lng;
            var φ1 = toRadians(lat1), φ2 = toRadians(lat2), Δλ = toRadians(lon2-lon1), R = 6371000; // gives d in metres
            var d = Math.acos( Math.sin(φ1)*Math.sin(φ2) + Math.cos(φ1)*Math.cos(φ2) * Math.cos(Δλ) ) * R;
            return Math.round(d * 0.0006213711);
        }
        var warehouseAPI = this;
        var startDate = query.startDate;
        var useageProfile = query.useageProfile;
        var editableResult = warehouse.toObject();
        var aggStorage = warehouseAPI.storagesToAggregateStorage(warehouse.storage, query);
        if (aggStorage && aggStorage.palletsWillFitAtThisDate(startDate, query.totalPallets)) {
            editableResult.storageProfile = aggStorage.generateContractStorageProfile(useageProfile);
            editableResult.distanceFromSearch = distanceInMiles(editableResult.geo , query.geo );
            editableResult.firstWeekPrice = aggStorage.getPriceForFirstWeek();
            return editableResult
        } else {
            return false;
        }
  },
  
  availableServices: function(){
	  return local.services;
  },
  availableSpecifications: function(){
	  return local.specifications;
  }
  
  
}

module.exports = mongoose.model('warehouses', warehouseSchema);