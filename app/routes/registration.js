var user_controller = require("../controllers/users.js"),
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
};
function registrationHandler(req,res){
	if(req.params.step > 1 && !req.data.user._id ){
		res.redirect('/provider-registration-1');
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
module.exports = handler;