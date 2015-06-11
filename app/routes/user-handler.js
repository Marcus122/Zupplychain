var user_controller = require("../controllers/users.js"),
	local = require("../local.config.js");

var handler = function(app) {
  app.post('/update-user', function(req, res) {
		//If user is not logged in then create user
		if(req.data.user){
			user = user_controller.user_by_id(req.data.user._id,function(err,user){
				if(user){
					updateUser(req, res, user);
				}else{
					createUser(req, res);
				}
			});
		}else{
			createUser(req, res);
		}
    });
  app.post('/get-user', function(req, res) {
	  if(req.data.user){
		  user = user_controller.user_by_id(req.body.cookie,function(err,user){
			 setResponse(user,res);
		  });
	  }
  });
};

function createUser(req,res,cb){
	user_controller.create_user(req.body,function(err,user){
		setCookie(user,res);
		setResponse(user,res);
	});
}
function updateUser(req, res, user){
	for(i in req.body){
		if(user[i]) user[i] = req.body[i];
	}
	user_controller.update_user(user,function(err){
		setResponse(user,res);
	});
}
function setResponse(data,res){
	res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: null, data: data };
    res.end(JSON.stringify(output) + "\n");
}
function setCookie(user,res){
	res.cookie('session-id',user._id,  local.cookie_config );
}
module.exports = handler;