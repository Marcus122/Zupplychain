var user_controller = require("../controllers/users.js"),
	local = require("../local.config.js"),
	User = require("../controllers/users.js");
	
var handler = function(app) {
  app.post('/update-user', function(req, res) {
        console.log("in update user");
		//If user is not logged in then create user
		if(req.data.user._id){
			user = user_controller.user_by_id(req.data.user._id,function(err,user){
				if(user){
                    console.log("setting user to active and updating email");
                    user.active = true;
					updateUser(req, res, user);
				}else{
					createUser(req, res);
				}
			});
		}else{
            console.log("creating new user");
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
  
  
	app.get('/login',function(req,res){
		if(Object.keys(req.data.user).length > 0){
			res.redirect('/dashboard');
		}else{
			res.render("login",req.data);
		}
	});
	app.post('/login-user',login,function(req,res){
		setResponse('Login Success',res);
	});
	app.get('/logout',logout,function(req,res){
		res.redirect("/");
	});
};

function logout(req,res,next) {
    User.logout(req, res, function(err, cb){
        next();
    });
}
function login(req,res,next){
	User.login(req, res, function(err, cb){
		if (!err){
			next();
		}else{
			setResponse({err:err.error},res);
		}
	});
}

function createUser(req,res,cb){
    if(!req.body.email || !req.body.password){
		res.writeHead(200, {"Content-Type": "application/json"});
		res.end(JSON.stringify({error:"required fields"}));
		return;
	}
    req.data.user.email = req.body.email;
	req.data.user.password = req.body.password;
	req.data.user.type = req.body["user-type"];
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

function setErrorResponse(err,res){
	res.writeHead(500, {"Content-Type": "application/json"});
    var output = { error: true, data: err };
    res.end(JSON.stringify(output) + "\n");
}
module.exports = handler;