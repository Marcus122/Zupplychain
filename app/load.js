var user_controller = require("./controllers/users.js");
var search_controller = require("./controllers/users.js");

module.exports = function(_data){
	var data=_data;
	return function(req,res,next){
		req.data={}
		req.data.live = data.live;
		req.data.user = {};
		var session = req.session //req.cookies["session-id"];
		if(!session) return next();
		user_controller.user_by_id(session.user_id,function(err,user){
			if(user){
				req.data.user = user;
			}
			return next();
		});
        //in here we could also load up the saved search.
        
	};
}
