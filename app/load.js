var user_controller = require("./controllers/users.js");

module.exports = function(_data){
	var data=_data;
	return function(req,res,next){
		req.data=data;
		debugger;
		var session = req.cookies.session;
		if(!session) return next();
		console.log(session);
		user_controller.user_by_id(session,function(err,user){
			if(!err){
				req.data.user = user;
			}
			return next();
		})
	};
}
