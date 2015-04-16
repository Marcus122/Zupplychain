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
};
function validateLogon(req,res,next){
	User.login(req,res,function(err,user){
		return err ? next() :  res.redirect('/dashboard');
	})
}
function checkForLogon(req,res,next){
	if(req.data.user.active) next();
	res.redirect('/');
}
module.exports = handler;