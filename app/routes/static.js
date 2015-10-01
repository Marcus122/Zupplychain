var Quote = require("../controllers/quote.js");
var local = require("../local.config.js");

var handler = function(app) {
    
    app.get('/about-us', function (req,res) {
		res.render("about-us",req.data);
	});
    app.get('/contact-us', function (req,res) {
        req.data.config = local.config;
		res.render("contact-us",req.data);
	});
    app.get('/emails', function (req,res) {
		res.render("emails/selector",req.data);
	});
    app.get('/emails/:template', function (req,res) {
		res.render("emails/" + req.params.template,req.data);
	});
    app.get('/emails/:template/:quoteId', function (req,res) {
        Quote.getById(req.params.quoteId, function(err, quote) {
            if (err || !quote) {
                console.log("couldn't find quote to load email template");
            }
            req.data.config = local.config;
            req.data.quote = quote;
            console.log("quote that was loaded:");
            console.log(quote);
            res.render("emails/" + req.params.template,req.data);
        });
	});
};
module.exports = handler;