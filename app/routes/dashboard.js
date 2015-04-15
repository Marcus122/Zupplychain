var handler = function(app) {
	app.get('/dashboard', function(req,res){
		res.render("dashboard",req.data);
	});
};
module.exports = handler;