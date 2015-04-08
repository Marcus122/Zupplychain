var user_controller = require("../controllers/users.js"),
	warehouse_controller = require("../controllers/warehouses.js"),
	local = require("../local.config.js");

var handler = function(app) {
  app.post('/create-warehouse', function(req, res) {
		//If user is not logged in then create user
		if(req.data.user){
			user = user_controller.user_by_id(req.data.user._id,function(err,user){
				//If no user then create
				if(!user){
					createUser(req, res);
				}else{
					createWarehouse(user,req,res);
				}
			});
		}else{
			createUser(req, res);
		}
  });
  app.post('/update-warehouse',function(req,res){
		warehouse_controller.warehouse_by_id(req.body.id,function(err,warehouse){
			if(!err){
				for(i in req.body){
					if(warehouse[i]) warehouse[i] = req.body[i];
				}
				warehouse.save(function(err){
					setResponse(warehouse,res);
				});
			}else{
				setResponse(err,res);
			}
		});
  });
};
function createUser(req,res){
	var data={};
	user_controller.create_user(data,function(err,user){
		setCookie(user,res);
		createWarehouse(user,req,res);
	});
}
function createWarehouse(user,req,res){
	user.addWarehouse(req.body)
}
function setResponse(data,res){
	res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: null, data: data };
    res.end(JSON.stringify(output) + "\n");
}
function setCookie(user,res){
	res.cookie('session-id',user._id,local.cookie_config );
}
module.exports = handler;