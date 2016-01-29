var user_controller = require("./controllers/users.js");
var search_controller = require("./controllers/users.js");
var local = require("./local.config.js");
var utils = require("./utils.js");

module.exports = function(_data){
	var data=_data;
	return function(req,res,next){
		req.data={}
		req.data.live = data.live;
        req.data.config = local.config;
        req.data.utils = utils;
		req.data.user = {};
        if(req.session.cookiePolicyAgreed === undefined){
            req.session.cookiePolicyAgreed = false;
        }else{
            req.session.cookiePolicyAgreed = true; 
        }        
        req.data.cookiePolicyAgreed = req.session.cookiePolicyAgreed;
		var session = req.session //req.cookies["session-id"];
		if(!session || !session.user_id) {
            return next();
        }
		user_controller.user_by_id(session.user_id,function(err,user){
			if(user){
				req.data.user = user;
			}
			return next();
		});
        
        
	};
}
