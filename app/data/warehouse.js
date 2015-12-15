'use strict';

var mongoose = require('mongoose'),
  deepPopulate = require('mongoose-deep-populate')(mongoose),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	Storage = require("./storage.js"),
	local = require("../local.config.js"),
    AggregateStorage = require("./aggregate-storage.js"),
    Utils = require("../utils.js");

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
	photos: Schema.Types.Mixed,
  defaultPhoto: String,
	active: { type: Boolean, default: false },
	created: { type: Date , default: Date.now },
	storage: [{ type: Schema.ObjectId, ref: 'storage' }],
  insurance: {
    allProdInsurance: {type:String},
    maximumInsuranceLevel: {type:String},
    additionalInsurance: {type:String},
    productExceptions: {type:String}
  },
	geo: {
		lat: { type: Number },
		lng: { type: Number }
	},
    loc  :{
        type : { type: String},
        coordinates: [Number]
    },
    noDiscount:{type: Number },
    discounts:[{
		from:Number,
		to:Number,
		perc:Number
	}],
    rating: {type: Number},
    documents: Schema.Types.Mixed,
    contacts: {type: Schema.ObjectId, ref: 'warehouseContacts' }
};

var warehouseSchema = new Schema(fields);
warehouseSchema.plugin(deepPopulate);
warehouseSchema.index({ loc: '2dsphere' });

// INSTANCE METHODS

warehouseSchema.pre('init', function(next, data) {
    //we can do any pre-loading data assignment in here if we want.
    next();
});

warehouseSchema.methods.generateStorageProfile = function(query) {
    var warehouseAPI = this;
    var storages = this.storage;
    var aggStorage = this.constructor.storagesToAggregateStorage(this, query); // '.constructor' just lets us call a static method from an instance method.
    this.storageProfile = aggStorage.generateContractStorageProfile(query.useageProfile);
    this.useageProfile = query.useageProfile;
    this.storageTemps = aggStorage.getAvailableStorageTemps();
};

// STATIC METHODS

warehouseSchema.statics = {
	load: function (id, cb) {
		this.findOne({ _id : id })
		  .populate('storage')
		  .populate('user')
      .deepPopulate(['contacts.creditController.user','contacts.invoiceController.user','contacts.pickingDispatch.user','contacts.goodsIn.user','contacts.transportCoordinator.user','contacts.enquiresController.user','contacts.availabilityController.user'])
		  .exec(cb);
  },
  loadByUser: function(user,cb){
	 this.find({'user': user._id})
		  .populate({
			  	path:'storage',
				options:{
					sort:['storage.sortOrder']
				}
			})
		  .populate('user')
		  .exec(cb);
  },
  loadByWarehousesContacts: function(id,cb){
    this.find({contacts:id}).exec(cb);
  },
  remove: function(id,cb){
      this.find({_id: id}).remove().exec(cb);
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
  
  checkPalletWidthIsValidSize: function(selectedPalletWidth,palletSize){ //A valid size is a size which is the >= the selected pallet size
    return Number(local.config.palletTypes[palletSize]) >= Number(local.config.palletTypes[selectedPalletWidth]);
  },
  
  //Don't check pallet types match anymore
  storagesToAggregateStorage: function(warehouse, query) {  
    var storage = warehouse.storage;
    var volumeDiscounts = warehouse.discounts;
    query.palletType   = parseInt(query.palletType,10);
    query.temp         = parseInt(query.temp,10);
    query.totalPallets = parseInt(query.totalPallets,10);
    var matchingStorages = [];
    var k = 0;
    //Remove storages with pallet types that are too small so if quered 1.2 remove 1.0.
    for (var j=0; j<storage.length; j++){
        //var palletTypeOK  = !query.palletType || storage[j].palletType == 0 || storage[j].palletType === query.palletType; //!palletType means any
        var maxWeightOK   = !query.weight || storage[j].maxWeight >= query.weight;
        var maxHeightOK   = !query.height || storage[j].maxHeight >= query.height;
        var tempOK        = storage[j].temp === query.temp;
        
        // if (palletTypeOK && maxWeightOK && maxHeightOK && tempOK) {
        //     matchingStorages.push(storage[j]);
        // }
        if(maxWeightOK && maxHeightOK && tempOK && this.checkPalletWidthIsValidSize(query.palletType,parseInt(storage[j].palletType))) {
             matchingStorages.push(storage[j]);
        }
    }
    if (matchingStorages.length == 0) {
        return false;
    }
    var aggStorage = new AggregateStorage(matchingStorages, volumeDiscounts);
    return aggStorage;
  },
  
  checkBasicPricingSet: function(storages,discounts,query){
      var matchingStorages = [];
      var volumeDiscounts = discounts;
      for (var j=0; j<storages.length; j++){
          if (storages[j].basicPricing.price > 0){
              matchingStorages.push(storages[j]);
          }
      }
      if (matchingStorages.length == 0) {
          return false;
      }
      var aggStorage = new AggregateStorage(matchingStorages, volumeDiscounts);
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
        var warehouseAPI = this;
        var editableResult = warehouse.toObject();
        var aggStorage = warehouseAPI.storagesToAggregateStorage(warehouse, query);
        if (aggStorage){
          aggStorage = warehouseAPI.checkBasicPricingSet(aggStorage.getStorages(),aggStorage.getVolumeDiscount(),query);
        }
        if (aggStorage && aggStorage.palletsWillFitAtThisDate(query.startDate, query.totalPallets,query.palletType)) {
            editableResult.storageProfile = aggStorage.generateContractStorageProfile(query.useageProfile);
            editableResult.distanceFromSearch = Utils.distanceInMiles(editableResult.geo , query.geo );
            editableResult.firstWeekPrice = aggStorage.getPriceForFirstWeek();
            editableResult.storageTemps = aggStorage.getAvailableStorageTemps();
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
//used to be 'warehouses' if we get an error change it back.
module.exports = mongoose.model('warehouse', warehouseSchema);