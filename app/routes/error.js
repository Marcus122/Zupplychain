
var handler = function(app) {
	/**
	* Error handling
	*/
	app.use(function (err, req, res, next) {
		// treat as 404
		if (err.message
		  && (~err.message.indexOf('not found')
		  || (~err.message.indexOf('Cast to ObjectId failed')))) {
		  return next();
		}
		console.error(err.stack);
		// error page
		res.status(500).render('500', { error: err.stack });
	});
	app.use('*', function(req, res) {
		try {
			res.render(req.path.substring(1, req.path.length),req.data); //strip leading '/'
		}
		catch (ex){
			res.status(404).send("404 : page not found");
		}
			
	});
	app.post('*', function(req, res) {
		console.log("connection: POST " + req.path);
		var path =  req.path + '.html';
		res.redirect(path);
	});
};

module.exports = handler;