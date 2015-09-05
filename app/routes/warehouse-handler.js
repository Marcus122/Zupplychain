"use strict";
var user = require("../controllers/users.js"),
warehouse = require("../controllers/warehouses.js"),
storage = require("../controllers/storage.js"),
local = require("../local.config.js"),
search = require("../controllers/search.js"),
quote = require("../controllers/quote.js"),
async = require("async"),
Utils = require("../utils.js");

var handler = function(app) {
	app.param('warehouse_id', warehouse.load);
	
	app.get('/warehouse/:warehouse_id', setResponse);
	
	app.get('/warehouse-profile/:warehouse_id', warehouseProfile );
	
	app.post('/warehouse/:warehouse_id', warehouseAuth, updateWarehouse );
	
	app.post('/warehouse', function(req, res) {
		if(req.data.user._id){ //If user is not logged in then create user
			createWarehouse(req,res);
		}else{
			createUser(req, res);
		}
	});
	app.post('/warehouse/:warehouse_id/storage',createStorage);
	app.post('/warehouse/:warehouse_id/storage/batch',batchStorage);
	app.param('storage_id', storage.load);
	app.post('/warehouse/:warehouse_id/storage/:storage_id', warehouseAuth,  updateStorage);
	app.get('/storage/:storage_id', setStorageResponse );
    app.post('/warehouse/:warehouse_id/volumeDiscount',updateVolumeDiscount);
    app.get("/warehouse-registration-complete/:warehouse_id", warehouseRegistrationComplete)
};


function warehouseRegistrationComplete(req,res) {
    res.render("registration-complete",req.data);
}

function updateVolumeDiscount(req,res) {
    var volumeDiscountData = {}
    volumeDiscountData.noDiscount = req.body.noDiscount;
    volumeDiscountData.discounts = req.body.discounts;
    req.data.warehouse = req.warehouse;
    warehouse.updateVolumeDiscount(req.warehouse, volumeDiscountData, function(err, result){
        if (err) {
            console.log("failed to update volume discount");
            setErrorResponse(err,res);
        } else {
            setResponse(req,res,result);
        }
    });

    
}

function warehouseProfile (req,res){
    req.data.warehouse = req.warehouse;

    if (req.query.fromSearch && req.session.whSC && req.session.whSC.sc && req.session.whSC.sc.length > 0) {
        req.data.minDurationOptions = local.config.minDurationOptions;
        req.data.temperatures = local.config.temperatures;
		req.data.page = 'warehouse-profile';
        var query = search.getFromSession(req, function(err, query){
            if (!err) {
                req.data.warehouse.generateStorageProfile(query);
            }
            res.render("warehouse-profile",req.data);
        });
    }
}

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
	Utils.getLatLong(req.body.postcode,function(err,latlng){
		if (latlng.lat === null && latlng.lng === null){
			req.warehouse = warehouse.createWarehouseObject(req.body);
			req.warehouse.geo.lat = null; 
			req.warehouse.geo.lng = null;
			setResponse(req,res);
		}else{
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
		}
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
	var idsMatch = Utils.checkUserSameAgainstLoadedWarehouse(req.warehouse,req.data.user);
	if (!idsMatch){
		user.logout(req,res,function(err,cb){
			setErrorResponse("Users do not Match",res);
		});
	}else{
		var storageArr=[];
		var sortOrder = 0;
		async.each(req.body, function(_storage,callback){
			console.log("saving a storage");
			sortOrder++;
			_storage.sortOrder = sortOrder;
			if(!_storage._id){ //if no id, create a new storage.
				console.log("creating storage: " + _storage._id);
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
			}else{ //otherwise update it.
				_storage.user=req.data.user._id;
				delete _storage.__v;
				storage.updateWithData(_storage,function(err,Storage){
					console.log("updating storage: " + _storage._id);
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
}
function updateWarehouse(req,res){
	async.waterfall([
		//Any data request go here
		function(callback){
			if(req.body.postcode != req.warehouse.postcode){
				Utils.getLatLong(req.body.postcode,function(error,latlng){
					req.body.geo=latlng;
					req.body.loc = { 'type' : 'Point', 'coordinates' : [latlng.lng, latlng.lat] };
					callback(error);
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
