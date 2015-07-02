var handler = function(app) {
  app.get('/about-us', function (req,res) {
	  console.log("about us");
		res.render("about-us",req.data);
	});
};
module.exports = handler;