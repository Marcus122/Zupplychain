var handler = function(app) {
	app.get('/dashboard', checkForLogon, function(req,res){
		res.render("dashboard",req.data);
	});
};
function checkForLogon(req,res,next){
	if(req.data.user.active) next();
	res.redirect('/');
}
module.exports = handler;