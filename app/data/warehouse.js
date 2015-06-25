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
  
  filterStorageOnQuery: function(storage, query) {      
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
        if (storage[j].palletSpaces < query.totalPallets) {
            continue; //we can bail out early if the totalPallet space is too small for our query.
        }
        
        var spacesOK      = false;
        for (var k in storage[j].pallets) {  //check that there is availability at the query start date.
            var startDate = query.startDate;
            if (! (query.startDate instanceof Date))
            {
                startDate = new Date(query.startDate);
            } 
            if (storage[j].pallets[k].from <= startDate 
                &&  storage[j].pallets[k].to >= startDate 
                && storage[j].pallets[k].free > query.totalPallets) {
                    spacesOK = true;
                    break;
                }
        }
        if (palletTypeOK && maxWeightOK && maxHeightOK && tempOK && spacesOK){
            matchingStorages.push(storage[j].toObject());
        }
    }
    return matchingStorages;       
  },
  
  search_by_query: function(query, cb) {
    var warehouseAPI = this;
    var editableResult = null; //stores a toObject() version of the warehouse which we can add properties to etc.
	var corrResults = [];
	
	function distanceInMiles(point1, point2) {
        function toRadians(degrees) {
            return degrees * Math.PI / 180;
        }
        var lat1 = point1.lat;
        var lat2 = point2.lat;
        var lon1 = point1.lng;
        var lon2 = point2.lng;
        var φ1 = toRadians(lat1), φ2 = toRadians(lat2), Δλ = toRadians(lon2-lon1), R = 6371000; // gives d in metres
        var d = Math.acos( Math.sin(φ1)*Math.sin(φ2) + Math.cos(φ1)*Math.cos(φ2) * Math.cos(Δλ) ) * R;
       
        return Math.round(d * 0.0006213711);
    }    
	
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
                          var matchingStorages = [];
                          editableResult = result[i].toObject(); //turn warehouse into a nice plain JS object.
                          var matchingStorage = warehouseAPI.filterStorageOnQuery(result[i].storage, query);
                          if (matchingStorage.length > 0) {
                              matchingStorage.sort(function(a,b){return a.currentPricing.price - b.currentPricing.price});
                              editableResult.storageMatch = matchingStorage[0]; //this 'storageMatch' is the one who's details we show on the search page.
                              editableResult.storage = matchingStorage;//limit the storage to ones that match.
						      editableResult.distanceFromSearch = distanceInMiles(editableResult.geo , query.geo );
                        	  corrResults.push(editableResult);
						  }
					  };
                      corrResults.sort(function(a,b) {
                          return a.distanceFromSearch-b.distanceFromSearch;
                      });
					  cb(err,corrResults) ;
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