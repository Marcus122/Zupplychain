var user = require("../controllers/users.js"),
	warehouse = require("../controllers/warehouses.js"),
	storage = require("../controllers/storage.js"),
	local = require("../local.config.js");

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
};
function createUser(req,res){
	var data={};
	user.create(data,function(err,user){
		setCookie(user,res);
		createWarehouse(req,res);
	});
}
function createWarehouse(req,res){
	warehouse.create(req.data.user,req.body,function(err,warehouse){
		if(err){
			setErrorResponse(err,res);
		}else{
			req.warehouse = warehouse;
			setResponse(req,res);
		}
	});
}
function createStorage(req,res,next){
	if(!req.warehouse) next();
	storage.create(req.warehouse,req.body,function(err,storage){
		if(err){
			setErrorResponse(err,res);
		}else{
			req.storage = storage;
			setStorageResponse(req,res);
		}
	});
}
function updateWarehouse(req,res){
	warehouse.update(req.warehouse,req.body,function(err){
		if(err){
			setErrorResponse(err,res);
		}else{
			setResponse(req,res);
		}
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