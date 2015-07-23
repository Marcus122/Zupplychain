var user = require("../controllers/users.js"),
	warehouse = require("../controllers/warehouses.js"),
	storage = require("../controllers/storage.js"),
	local = require("../local.config.js"),
    search = require("../controllers/search.js");
	async = require("async");
	// UKPostcodes = require("uk-postcodes-node");
var extra = {
	apiKey : '',
	formatter: null
};
var geocoderProvider = 'google';
var httpAdapter = 'http';
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);

var handler = function(app) {
	app.param('warehouse_id', warehouse.load);
	
	app.get('/warehouse/:warehouse_id', setResponse);
	
	app.get('/warehouse-profile/:warehouse_id', function(req,res){
		req.data.warehouse = req.warehouse;
        if (req.query.fromSearch && req.session.whSC && req.session.whSC.sc && req.session.whSC.sc.length > 0) {
            req.data.minDurationOptions = local.config.minDurationOptions;
            //should probably load the query from db rather than session?
            var query = req.session.whSC.sc[0];
            query.height = Number(query.height);
            query.weight = Number(query.weight);
            query.totalPallets = Number(query.totalPallets);
            //rather than limit storage to matching... we need to build the storage profile
            // and attach the storageProfile to the warehouse.
            req.data.warehouse.generateStorageProfile(query);
            req.data.temperatures = local.config.temperatures;
        }
		res.render("warehouse-profile",req.data);
	});
	
	app.post('/warehouse/:warehouse_id', warehouseAuth, updateWarehouse );
	
	app.post('/warehouse', function(req, res) {
		//If user is not logged in then create user
		if(req.data.user._id){
			createWarehouse(req,res);
		}else{
			createUser(req, res);
		}
	});
	app.post('/warehouse/:warehouse_id/storage',createStorage);
	app.post('/warehouse/:warehouse_id/storage/batch',batchStorage);
	
	app.param('storage_id', storage.load);
	app.post('/warehouse/:warehouse_id/storage/:storage_id', warehouseAuth,  updateStorage );
	app.get('/storage/:storage_id', setStorageResponse );
};

function createUser(req,res){
	user.create(req,res,{},function(err,user){
		createWarehouse(req,res);
	});
}
function warehouseAuth(req,res,next){
	if(req.warehouse.user._id.equals( req.data.user._id) ) return next();
	setResponse(req,res,next);
}
function createWarehouse(req,res){
	getLatLong(req.body.postcode,function(latlng){
		req.body.geo = latlng;
        req.body.loc = { 'type' : 'Point', 'coordinates' : [latlng.lng, latlng.lat] };
		warehouse.create(req.data.user,req.body,function(err,Warehouse){
			if(err){
				setErrorResponse(err,res);
			}else{
				req.warehouse = Warehouse;
				setResponse(req,res);
			}
		});
	});
}
function storageAuth(req,res,next){
	if(req.storage.user._id.equals( req.data.user._id) ) return next();
	setStorageResponse(req,res,next);
}
function createStorage(req,res,next){
	if(!req.warehouse) next("Warehouse not found");
	storage.create(req.data.user, req.body,function(err,storage){
		if(err){
			setErrorResponse(err,res);
		}else{
			req.storage = storage;
			req.warehouse.storage.push(storage._id);
			req.warehouse.save(function(){
				setStorageResponse(req,res,next);
			});
		}
	});
}
function updateStorage(req,res,next){
	storage.update(req.storage,req.body,function(err){
		if(err){
			setErrorResponse(err,res);
		}else{
			setStorageResponse(req,res);
		}
	});
}
function batchStorage(req,res){
	if(!req.warehouse) next();
	var storageArr=[];
	var sortOrder = 0;
	async.each(req.body, function(_storage,callback){
		sortOrder++;
		_storage.sortOrder = sortOrder;
		if(!_storage._id){
			delete _storage._id;
			storage.create(req.data.user,_storage,function(err,Storage){
				if(err){
					console.log(err);
					callback(err);
				}else{
					storageArr.push(Storage._id);
					callback();
				}
			});
		}else{
			_storage.user=req.data.user._id;
			delete _storage.__v;
			storage.updateWithData(_storage,function(err,Storage){
				if(!err){
					storageArr.push(Storage._id);
					callback();
				}else{
					console.log(err);
					callback(err);
				}
			});
		}
		
	},function(err){
		if(!err){	
			req.warehouse.storage=storageArr;
			req.warehouse.save(function(){
				setResponse(req,res);
			});
		}else{
			setErrorResponse(err,res);
		}
	});
}
function updateWarehouse(req,res){
	async.waterfall([
		//Any data request go here
		function(callback){
			if(req.body.postcode != req.warehouse.postcode){
				getLatLong(req.body.postcode,function(latlng){
					req.body.geo=latlng;
					callback(null);
				});
			}else{
				callback(null);
			}
		}

	],function (err, result) {
		warehouse.update(req.warehouse,req.body,function(err){
			if(err){
				setErrorResponse(err,res);
			}else{
				setResponse(req,res);
			}
		});
	});
}
function getLatLong(postcode,cb){
	var geo = {
		lat:"",
		lng:""
	};
	if(!postcode) return cb(geo);
	geocoder.geocode(postcode, function(error, result){
		if(!error){
			if (result && result.length > 0) {
				geo.lat = result[0].latitude;
				geo.lng = result[0].longitude;
			} else { //we didn't get a result back from google.
				
			}
		}else{
			console.log ("in warehouse-handler.js");
			console.log("error in Google Geolocation module:");
			console.log(error);
		}
		return cb(geo);
	});
}
function setResponse(req,res){
	res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: null, data: req.warehouse.toObject({
		versionKey:false
	}) };
    res.end(JSON.stringify(output) + "\n");
}
function setStorageResponse(req,res,next){
	if(!req.storage) next();
	res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: null, data: req.storage.toObject({versionKey:false})};
    res.end(JSON.stringify(output) + "\n");
}
function setErrorResponse(err,res){
	res.writeHead(500, {"Content-Type": "application/json"});
    var output = { error: true, data: err };
    res.end(JSON.stringify(output) + "\n");
}
module.exports = handler;