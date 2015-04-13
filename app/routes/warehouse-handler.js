var user = require("../controllers/users.js"),
	warehouse = require("../controllers/warehouses.js"),
	storage = require("../controllers/storage.js"),
	local = require("../local.config.js"),
	async = require("async"),
	UKPostcodes = require("uk-postcodes-node");

var handler = function(app) {
	app.param('warehouse_id', warehouse.load);
	
	app.get('/warehouse/:warehouse_id', setResponse);
	
	app.post('/warehouse/:warehouse_id', updateWarehouse );
	
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
	app.post('/stroage/:storage_id', updateStorage );
};
function createUser(req,res){
	var data={};
	user.create(data,function(err,user){
		setCookie(user,res);
		req.data.user=user;
		createWarehouse(req,res);
	});
}
function createWarehouse(req,res){
	getLatLong(req.body.postcode,function(latlng){
		req.body.geo = latlng;
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
function createStorage(req,res,next){
	if(!req.warehouse) next("Warehouse not found");
	storage.create(req.body,function(err,storage){
		if(err){
			setErrorResponse(err,res);
		}else{
			req.storage = storage;
			req.warehouse.storage.push(storage._id);
			req.warehouse.save(function(){
				setStorageResponse(req,res);
			});
		}
	});
}
function batchStorage(req,res){
	if(!req.warehouse) next();
	req.warehouse.storage=[];
	async.each(req.body, function(_storage,callback){
		if(!_storage.id){
			storage.create(_storage,function(err,Storage){
				req.warehouse.storage.push(Storage._id);
				callback();
			});
		}else{
			storage.updateWithData(_storage,function(err,Storage){
				req.warehouse.storage.push(Storage._id);
				callback();
			});
		}
		
	},function(err){
		req.warehouse.save(function(){
			setResponse(req,res);
		});
	});
}
function updateWarehouse(req,res){
	async.waterfall([
		//Any data request go here
		function(callback){
			getLatLong(req.body.postcode,function(latlng){
				req.body.geo=latlng;
				callback(null);
			});
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
	UKPostcodes.getPostcode(postcode, function (error, data) {
		if(!error){
			geo.lat = data.geo.lat;
			geo.lng = data.geo.lng;
		}
		return cb(geo);
	});
}
function setResponse(req,res){
	res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: null, data: req.warehouse };
    res.end(JSON.stringify(output) + "\n");
}
function setStorageResponse(req,res){
	res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: null, data: req.storage };
    res.end(JSON.stringify(output) + "\n");
}
function setErrorResponse(err,res){
	res.writeHead(500, {"Content-Type": "application/json"});
    var output = { error: true};
    res.end(JSON.stringify(output) + "\n");
}
function setCookie(user,res){
	res.cookie('session-id',user._id,local.cookie_config );
}
module.exports = handler;