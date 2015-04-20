var user_controller = require("./controllers/users.js");

module.exports = function(_data){
	var data=_data;
	return function(req,res,next){
		req.data={}
		req.data.live = data.live;
		req.data.user = {};
		var session = req.cookies["session-id"];
		if(!session) return next();
		user_controller.user_by_id(session,function(err,user){
			if(user){
				req.data.user = user;
			}
			return next();
		})
	};
}
