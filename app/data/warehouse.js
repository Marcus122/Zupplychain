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
    var corrResult = false;
	var corrResults = [];
	
	if (!query.weight){
		query.weight = '100';
	}
	
	if (!query.height){
		query.height = '10';
	}
	
	var newsDistances = getNewsDistances(query.geo.lat,query.geo.lng,query.radius);
	
    // this.find({
              // "geo.lat":{ $gte:(query.geo.lat -80), $lte:(query.geo.lat + 80)},
              // "geo.lng":{ $gte:(query.geo.lng -80), $lte:(query.geo.lng + 80)},
              // "active": true
              // },
              // function(err,result){
              // }).populate({ path : "storage", match : {palletType : query.palletType} }).exec(cb);
    this.find({
			  "geo.lat":{ $gte:(query.geo.lat -80), $lte:(query.geo.lat + 80)},
              "geo.lng":{ $gte:(query.geo.lng -80), $lte:(query.geo.lng + 80)},
              "active": true
              }).populate({ path : "storage", match : {palletType : query.palletType,
													   maxWeight : {$gte:query.weight},
													   maxHeight : {$gte:query.height},
													   temp : query.temp,
													   palletSpaces : query.totalPallets}
			  }).exec( function (err, result){
				  if (err){
					  console.log(err);
				  }else{
					  for(var i in result){
						  corrResult = false;
						  for (var j=0; j<result[i].storage.length; j++){
							  if (result[i].storage[j].palletType === query.palletType && result[i].storage[j].maxWeight >= query.weight
								  && result[i].storage[j].maxHeight >= query.height	&& result[i].storage[j].temp === query.temp
								  && result[i].storage[j].palletSpaces == query.totalPallets){
								  corrResult = true;
							  }
						  }
						if(corrResult === true){
							corrResults.push(result[i]);
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

function getNewsDistances(lat,lng,d){
	var rad = Math.PI/180;
	var tc = [rad*0,rad*90,rad*180,rad*270];
	var arr = []
	var lonn;
	var latt;
	
	for (var i = 0; i < tc.length; i++){
		latt = Math.asin(Math.sin(lat)*Math.cos(d)+Math.cos(lat)*Math.sin(d)*Math.cos(tc[i]));
		if (Math.cos(lat)==0){
			lonn = lng;
		}else{
			lonn = ((lng-Math.asin(Math.sin(tc[i])*Math.sin(d)/Math.cos(lat))+Math.PI)%(2*Math.PI))-Math.PI;
		} 
		arr.push({lat:latt, lng:lonn});
		
	}
	
	return arr;
	
	
}

module.exports = mongoose.model('warehouses', warehouseSchema);