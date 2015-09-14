"use strict";
var user = require("../controllers/users.js"),
warehouse = require("../controllers/warehouses.js"),
storage = require("../controllers/storage.js"),
local = require("../local.config.js"),
search = require("../controllers/search.js"),
quote = require("../controllers/quote.js"),
async = require("async"),
Utils = require("../utils.js"),
fh = require("../controllers/file-handler.js"),
multiparty = require('multiparty');

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

var POSTCODE_NOT_FOUND = 'Postcode not Found';


function warehouseRegistrationComplete(req,res) {
    res.render("registration-complete",req.data);
}

function uploadDocument(document,res,folder,warehouseId){
	var form = new multiparty.Form();
	fh.createDir(folder + warehouseId,function(err){
		if(!err){
			form.parse(document, function(err,fields,files){
				document.files - files[0];
				document.fields - fields;
				for (var i in files[0]){
					fh.writeFile(folder + warehouseId + '/' + files[0][i].path,function(err){
						if(err){
							setErrorResponse(err,res);
						}
					});
				}
			});
		}else{
			setErrorResponse(err,res);
		}
	})
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
			//req.warehouse = warehouse.createWarehouseObject(req.body);
			//req.warehouse.geo.lat = null; 
			//req.warehouse.geo.lng = null;
			//setResponse(req,res);
			if (err){
				setErrorResponse('Geolocation Error',res);
			}else{
				setPostcodeNotFoundResponse(POSTCODE_NOT_FOUND,res);
			}
		}else if(err){
			setErrorResponse('Geolocation Error',res);
		}else if (!err){
			req.body.geo = latlng;
			req.body.loc = { 'type' : 'Point', 'coordinates' : [latlng.lng, latlng.lat] };
			warehouse.create(req.data.user,req.body,function(err,Warehouse){
				if(err){
					setErrorResponse(err,res);
				}else{
					req.warehouse = Warehouse;
					for (var i = 0; i <= req.body.documents.length; i++){
						uploadDocument(req.body.documents[i],res,local.config.upload_folders[0],warehouse.id);
					}
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
					if (latlng.lat === null || latlng.lng === null){
						if (error){
							callback('Geolocation Error',res);
						}else{
							callback(POSTCODE_NOT_FOUND,res);
						}
					}else if(error){
						callback('Geolocation Error',res);
					}else{
						req.body.geo=latlng;
						req.body.loc = { 'type' : 'Point', 'coordinates' : [latlng.lng, latlng.lat] };
						callback(error);
					}
				});
			}else{
				callback(null);
			}
		}

	],function (err, result) {
		if (!err || err === '' || err === null || err === "" || err === undefined){
			warehouse.update(req.warehouse,req.body,function(err){
				if(err){
					setErrorResponse(err,res);
				}else{
					setResponse(req,res);
				}
			});
		}else{
			 if (err === POSTCODE_NOT_FOUND){
				 setPostcodeNotFoundResponse(POSTCODE_NOT_FOUND,res);
			 }else{
			 	setErrorResponse(err,res);
			 }
		 }
	});
}

function setResponse(req,res){
	res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: null, data: req.warehouse.toObject({
		versionKey:false
	}) };
    res.end(JSON.stringify(output) + "\n");
}
function setPostcodeNotFoundResponse(err,res){
	res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: true, data: err };
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
