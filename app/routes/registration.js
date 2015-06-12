var User = require("../controllers/users.js"),
	local = require("../local.config.js"),
	multiparty = require('multiparty'),
	fs = require('fs');

var handler = function(app) {
	console.log(local.config.upload_folder);
	app.get('/provider-registration', function(req,res){
		res.render("registration",req.data);
	});
	app.get('/provider-registration/:step', populateUserData, registrationHandler);
	app.get('/provider-registration-:step', populateUserData, registrationHandler);
	app.post('/provider-registration-:step', registrationHandler);
	app.post('/complete-registration',completeRegistration);
	app.post('/registration/upload',uploadFile,fileOutput);
};
function registrationHandler(req,res){
	//If active send to dashboard
	if(req.data.user.active){
		res.send({redirect: '/dashboard'});
	}
	else if(req.params.step > 1 && !req.data.user._id ){
		redirectToStart(res);
	}else{
		res.render("registration" + "-" + req.params.step,req.data);
	}
}
function populateUserData(req,res, next){
	req.data.services = local.config.services;
	req.data.specifications = local.config.specifications;
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
	req.data.user.confirm = req.body.confirm;
	if (req.body.confirm == req.body.password){
		User.register(req.data.user,function(err){
			if(err){
				var backURL=req.header('Referer') 
				return backURL ? res.redirect(backURL) : redirectToStart(res);
			}else{
				res.send({redirect: '/dashboard'});
			}
		})
	}
	
}
function uploadFile(req,res,next){
	var form = new multiparty.Form();
	 form.parse(req, function(err, fields, files) {
		req.files = files[0];
		req.fields = fields;
		for( i in files[0] ){
			fs.rename(files[0][i].path, local.config.upload_folder + files[0][i].originalFilename);
		}
		next();
    });
}
function redirectToStart(res){
	res.redirect('/provider-registration-1');
}
function fileOutput(req,res){
	var files=[];
	res.writeHead(200, {"Content-Type": "application/json"});
	for(i in req.files){
		var file={};
		file.name = req.files[i].originalFilename;
		files.push(file);
	}
	res.end(JSON.stringify(files));
}
module.exports = handler;