var User = require("../controllers/users.js"),
	local = require("../local.config.js");

var handler = function(app) {
	app.get('/provider-registration', function(req,res){
		res.render("registration",req.data);
	});
	app.get('/provider-registration/:step', populateUserData, function (req,res) {
		registrationHandler(req,res);
	});
	app.get('/provider-registration-:step', populateUserData, function (req,res) {
		registrationHandler(req,res);
	});
	app.post('/provider-registration-:step', function (req,res) {
		registrationHandler(req,res);
	});
	app.post('/complete-registration',completeRegistration);
};
function registrationHandler(req,res){
	if(req.params.step > 1 && !req.data.user._id ){
		redirectToStart(res)
	}else{
		res.render("registration" + "-" + req.params.step,req.data);
	}
}
function populateUserData(req,res, next){
	if(!req.data.user._id) return next();
	req.data.user.getWarehouses(function(warehouses){
		req.data.user.warehouses = warehouses;
		return next();
	});
}
function completeRegistration(req,res){
	if(!req.data.user._id) return redirectToStart(res);
	req.data.user.email = req.body.email;
	req.data.user.password = req.body.password;
	req.data.user.contact = req.body.contact;
	req.data.user.name = req.body.name;
	User.register(req.data.user,function(err){
		if(err){
			var backURL=req.header('Referer') 
			return backURL ? res.redirect(backURL) : redirectToStart(res);
		}else{
			return res.redirect('/dashboard');
		}
	})
	
}
function redirectToStart(res){
	res.redirect('/provider-registration-1');
}
module.exports = handler;