var RegisterForUpdates = require("../data/register-for-updates.js");

exports.saveData = function(name,company,email,telephone,cb){
	var data = {};
	data.name = name;
	data.email = email;
	data.companyName = company;
	data.telephone = telephone;
	
	var registerForUpdates = new RegisterForUpdates(data);
	
	registerForUpdates.save(function(err){
		if(err){
			cb(err);
		}else{
			cb(false);
		}
	});
}

exports.loadByRequestedDate = function(dateFrom,dateTo,cb){
	var jsDateFrom = new Date(parseInt(dateFrom.substring(0,4)), parseInt(dateFrom.substring(4,6)), parseInt(dateFrom.substring(6,8)));
	var jsDateTo = new Date(parseInt(dateTo.substring(0,4)), parseInt(dateTo.substring(4,6)), parseInt(dateTo.substring(6,8)));
	RegisterForUpdates.loadByRequestedDate(jsDateFrom,jsDateTo,function(err,results){
		if(err){
			cb(err);
		}else{
			cb(false,results);
		}
	});
}