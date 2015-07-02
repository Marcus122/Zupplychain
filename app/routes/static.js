var handler = function(app) {
  app.get('/about-us', function (req,res) {
		res.render("about-us",req.data);
	});
};
module.exports = handler;