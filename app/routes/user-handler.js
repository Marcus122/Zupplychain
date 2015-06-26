var user_controller = require("../controllers/users.js"),
	local = require("../local.config.js");

var handler = function(app) {
  app.post('/update-user', function(req, res) {
		//If user is not logged in then create user
		if(req.data.user._id){
			user = user_controller.user_by_id(req.data.user._id,function(err,user){
				if(user){
                    user.active = true;
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
		  user = user_controller.user_by_id(req.session.user_id,function(err,user){
			 setResponse(user,res);
		  });
	  }
  });
};

function createUser(req,res,cb){
    if(!req.body.email || !req.body.password){
		res.writeHead(200, {"Content-Type": "application/json"});
		res.end(JSON.stringify({error:"required fields"}));
		return;
	}
    req.data.user.email = req.body.email;
	req.data.user.password = req.body.password;
	user_controller.create(req, res, req.data.user ,function(err,user){
        if (err) {
            setErrorResponse(req, res);
        } else {
            //setCookie(user,res); //appears to be set in the user_controller.create() call now.
            setResponse(user,res);
        }
	});
}
function updateUser(req, res, user){
	for(i in req.body){
		if(user[i]) user[i] = req.body[i];
	}
	user_controller.update(user,function(err){
		setResponse(user,res);
	});
}
function setResponse(data,res){
	res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: null, data: data };
    res.end(JSON.stringify(output) + "\n");
}
/*function setCookie(user,res){
    console.log("saving user to cookie");
    req.session.user_id = user._id;
	//res.cookie('session-id',user._id,  local.cookie_config );
}*/
function setErrorResponse(err,res){
	res.writeHead(500, {"Content-Type": "application/json"});
    var output = { error: true, data: err };
    res.end(JSON.stringify(output) + "\n");
}
module.exports = handler;