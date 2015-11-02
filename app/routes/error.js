
var handler = function(app) {
	/**
	* Error handling
	*/
	app.use(function (err, req, res, next) {
		// treat as 404
		/*if (err.message
		  && (~err.message.indexOf('not found')
		  || (~err.message.indexOf('Cast to ObjectId failed')))) {
		  return next();
		}*/ //commented out as not sure what it's doing?
		console.error(err.stack);
		// error page
		if(err.code == 'EBADCSRFTOKEN'){
			var User = require('../controllers/users.js');
			User.logout(req,res,function(err,result){
				res.status(403).render('403', req.data);
			});
		}else{
			res.status(500).render('500', req.data);
		}
	});
	app.use('*', function(req, res) {
		try {
			//res.render(req.path.substring(1, req.path.length),req.data); //strip leading '/'
		}
		catch (ex){
			//res.status(404).send("404 : page not found");
		}
        res.status(404).render('404', req.data);
			
	});
	app.post('*', function(req, res) {
		console.log("connection: POST " + req.path);
		var path =  req.path + '.html';
		res.redirect(path);
	});
};

module.exports = handler;