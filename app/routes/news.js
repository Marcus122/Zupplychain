var local = require("../local.config.js");

var handler = function(app) {
	app.get('/news', function(req,res){
		req.data.id = undefined
		res.render("news",req.data);
	});
	app.get('/news-post-:id', function(req,res){
		req.data.id = req.params.id;
		res.render("news",req.data);
	});
};

module.exports = handler;