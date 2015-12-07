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