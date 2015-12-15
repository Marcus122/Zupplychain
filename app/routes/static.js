var local = require("../local.config.js");
var Quote = require("../controllers/quote.js");
var RegisterForUpdates = require("../controllers/register-for-updates.js");
var handler = function(app) {
    
    app.get('/about-us', function (req,res) {
		res.render("about-us",req.data);
	});
    app.get('/emails', function (req,res) {
		res.render("emails/selector",req.data);
	});
    app.get('/emails/:template', function (req,res) {
		res.render("emails/" + req.params.template,req.data);
	});
    app.get('/testimonials', function (req,res) {
		res.render("testimonials",req.data);
	});
    app.get('/reviews', function (req,res) {
		res.render("reviews",req.data);
	});
    app.get('/terms-and-conditions', function (req,res) {
         res.render("terms-and-conditions/terms-and-conditions-landing",req.data);
    });
    app.get('/terms-and-conditions/:page', function (req,res) {
        switch (req.params.page){
            case 't-and-c-sp-zc':
                res.render("terms-and-conditions/t-and-c-sp-zc",req.data);
                break;
            case 't-and-c-sp-c':
                res.render("terms-and-conditions/t-and-c-sp-c",req.data);
                break;
            case 'terms-of-service':
                res.render("terms-and-conditions/terms-of-service",req.data);
                break;
            case 'terms-of-use':
                res.render("terms-and-conditions/terms-of-website-use",req.data);
                break;
            case 'acceptable-user-policy':
                res.render("terms-and-conditions/acceptable-use-policy",req.data);
                break;
            case 'cookie-policy':
                res.render("terms-and-conditions/cookie-policy",req.data);
                break;
            case 'privacy-policy':
                res.render("terms-and-conditions/privacy-policy",req.data);
                break;
            default:
                res.render("terms-and-conditions/terms-and-conditions-landing",req.data);
                break;
        }
	});
    app.get('/emails/:template/:quoteId', function (req,res) {
        Quote.getById(req.params.quoteId, function(err, quote) {
            if (err || !quote) {
                console.log("couldn't find quote to load email template");
            }
            req.data.config = local.config;
            req.data.quote = quote;
            res.render("emails/" + req.params.template,req.data);
        });
	});
    app.post('/register-for-updates-emails',function(req,res){
        if(req.body.password === "password1234"){
            RegisterForUpdates.loadByRequestedDate(req.body.dateFrom,req.body.dateTo,function(err,result){
            var output
            if(err){
                    res.writeHead(200, {"Content-Type": "application/json"});
                    output = { error: true, data: err };
                    res.end(JSON.stringify(output) + "\n");
            }else{
                    res.writeHead(200, {"Content-Type": "application/json"});
                    output = { error: null, data: result };
                    res.end(JSON.stringify(output) + "\n");
            }
            });
        }
    });
};
module.exports = handler;