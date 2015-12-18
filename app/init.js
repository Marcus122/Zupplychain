var user_controller = require("./controllers/users.js");
var search_controller = require("./controllers/users.js");
var local = require("./local.config.js");
var utils = require("./utils.js");

module.exports = function(_data){
	var data=_data;
	return function(req,res,next){
		res.locals.session = req.session;
		res.locals.url = req.protocol + '://' + req.get('host') + req.originalUrl;
		res.locals.csrfTokenFunction = req.csrfToken;
		if(req.url == '/favicon.ico'){
			res.writeHead(200, {'Content-Type': 'image/x-icon'} );
			res.end();
		}else if(data.secure === true && req.protocol !== 'https'){
			res.redirect('https://' + req.headers.host + req.url);
		}else{
			next()
		}
	};
}