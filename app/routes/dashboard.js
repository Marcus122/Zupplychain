var User = require("../controllers/users.js");

var handler = function(app) {
	app.get('/dashboard', checkForLogon, function(req,res){
		res.render("dashboard",req.data);
	});
	app.get('/login',function(req,res){
		res.render("login",req.data);
	});
	app.post('/login',validateLogon,function(req,res){
		req.data.loginFailed=true;
		res.render("login",req.data);
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
        res.redirect("/", req.data);
    });
}
function validateLogon(req,res,next){
	User.login(req,res,function(err,user){
		return err ? next() :  res.redirect('/');
	})
}
function checkForLogon(req,res,next){
	if(req.data.user.active) return next();
	res.redirect('/');
}

module.exports = handler;