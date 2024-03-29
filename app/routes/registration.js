var User = require("../controllers/users.js"),
	local = require("../local.config.js"),
	multiparty = require('multiparty'),
	fs = require('fs');

var handler = function(app) {
	console.log(local.config.upload_folder);
	app.get('/provider-registration', function(req,res){
		res.render("registration",req.data);
	});
	app.get('/provider-registration/:step', populateData, registrationHandler);
	app.get('/provider-registration-:step', populateData, registrationHandler);
	app.post('/provider-registration-:step', registrationHandler);
	app.post('/complete-registration',completeRegistration);
	app.post('/save-registration',saveRegistration);
	app.post('/registration/upload',uploadFile,fileOutput);
};
function registrationHandler(req,res){
	//If active send to dashboard
	if(req.data.user.active){
		res.redirect('/dashboard');
	}
	else if(req.params.step > 1 && !req.data.user._id ){
		redirectToStart(res);
	}else{
		res.render("registration" + "-" + req.params.step,req.data);
	}
}
function populateData(req,res, next){
	req.data.services = local.config.services;
    req.data.palletTypes = local.config.palletTypes;
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
	User.register(req.data.user,function(err){
		if(err){
			var backURL=req.header('Referer') 
			return backURL ? res.redirect(backURL) : redirectToStart(res);
		}else{
			res.send({redirect: '/dashboard'});
		}
	});
}
function saveRegistration(req,res){
	if(!req.data.user._id) return redirectToStart(res);
	if(!req.body.email || !req.body.email){
		res.writeHead(200, {"Content-Type": "application/json"});
		res.end(JSON.stringify({error:"required fields"}));
		return;
	}
	req.data.user.email = req.body.email;
	req.data.user.password = req.body.password;
	User.update(req.data.user,function(err){
		res.writeHead(200, {"Content-Type": "application/json"});
		if(err){
			res.end(JSON.stringify(err));
		}else{
			res.end(JSON.stringify({error:false}));
		}
	});
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