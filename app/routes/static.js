var local = require("../local.config.js");
var Quote = require("../controllers/quote.js");
var RegisterForUpdates = require("../controllers/register-for-updates.js");
var handler = function(app) {
    
    app.get('/about-us', function (req,res) {
        req.data.pageTitle = 'Pallet Space Rental | Warehouse Storage Hire | ZupplyChain';
        req.data.description = 'ZupplyChain Is A Free UK-wide Logistics Marketplace Connecting Business With Pallet Storage Needs To  Warehousing Space Providers. Visit Now!';
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
        req.data.pageTitle = 'Reviews | Pallet Space | Warehouse Storage Hire | ZupplyChain';
        req.data.description = 'ZupplyChain Provides A Free And Safe UK-wide Marketplace For Registering, Searching & Hiring Storage Space. Contact Us Now!';
		res.render("reviews",req.data);
	});
    app.get('/faq', function (req,res) {
        req.data.pageTitle = 'FAQs | Warehousing & Pallet Space Search | ZupplyChain';
        req.data.description = 'FAQs To Answer Queries Regarding Warehouse Storage Registration And Searching For Available Pallet Space | ZupplyChain - Logistics Solutions Marketplace.';
		res.render("faq",req.data);
	});
    app.get('/terms-and-conditions', function (req,res) {
         req.data.pageTitle = 'T&Cs | Warehousing | Available Pallet Space Hire | ZupplyChain';
         req.data.description = 'ZupplyChain Offers A Transparent & Trustworthy Platform For Registering, Searching & Hiring Available Warehouse Space For Palletised Storage. Visit Now!';
         res.render("terms-and-conditions/terms-and-conditions-landing",req.data);
    });
    app.post('/agree-cookie-policy', function (req,res) {
         var output;
         req.session.cookiePolicyAgreed = true;                    
         res.writeHead(200, {"Content-Type": "application/json"});
         output = { error: false, data: 'Success' };
         res.end(JSON.stringify(output) + "\n");
    });
    app.get('/terms-and-conditions/:page', function (req,res) {
        req.data.pageTitle = 'T&Cs | Warehousing | Available Pallet Space Hire | ZupplyChain';
        req.data.description = 'ZupplyChain Offers A Transparent & Trustworthy Platform For Registering, Searching & Hiring Available Warehouse Space For Palletised Storage. Visit Now!';
        switch (req.params.page){
            case 't-and-c-sp-zc':
                req.data.pageTitle = 'T&Cs | On-Demand Warehouse Storage & Pallet Space | ZupplyChain';
                req.data.description = 'ZupplyChain Offers A Transparent & Trustworthy Platform For Registering, Searching & Hiring Available Warehouse Space For Palletised Storage. Visit Now!';
                res.render("terms-and-conditions/t-and-c-sp-zc",req.data);
                break;
            case 't-and-c-sp-c':
                req.data.pageTitle = 'T&Cs | Warehouse Storage Hire | Pallet Space | ZupplyChain';
                req.data.description = 'ZupplyChain Offers A Transparent & Trustworthy Platform For Registering, Searching & Hiring Available Warehouse Space For Palletised Storage. Visit Now!';
                res.render("terms-and-conditions/t-and-c-sp-c",req.data);
                break;
            case 'terms-of-service':
                req.data.pageTitle = 'T&Cs | On-Demand Warehouse Space | Pallet Storage | ZupplyChain';
                req.data.description = 'ZupplyChain Offers A Transparent & Trustworthy Platform For Registering, Searching & Hiring Available Warehouse Space For Palletised Storage. Visit Now!'
                res.render("terms-and-conditions/terms-of-service",req.data);
                break;
            case 'terms-of-use':
                req.data.pageTitle = 'T&Cs | Available Warehouse Space | Pallet Storage | ZupplyChain';
                req.data.description = 'ZupplyChain Offers A Transparent & Trustworthy Platform For Registering, Searching & Hiring Available Warehouse Space For Palletised Storage. Visit Now!';
                res.render("terms-and-conditions/terms-of-website-use",req.data);
                break;
            case 'acceptable-user-policy':
                req.data.pageTitle = 'T&Cs | On-Demand Search | Warehouse Pallet Space | ZupplyChain';
                req.data.description = 'ZupplyChain Is A Marketplace That Helps Find Available UK Warehouse Space For All Palletised Storage Needs - Search Our Database Now!';
                res.render("terms-and-conditions/acceptable-use-policy",req.data);
                break;
            case 'cookie-policy':
                req.data.pageTitle = 'T&Cs | Warehouse Space For Palletised Storage | ZupplyChain';
                req.data.description = 'ZupplyChain Is A Marketplace That Helps Connect Available UK Warehouse Space To Those Needing Palletised Storage - Search Our Database Now!'; 
                res.render("terms-and-conditions/cookie-policy",req.data);
                break;
            case 'privacy-policy':
                req.data.pageTitle = 'T&Cs | Available Warehouse Space For Pallet Storage | ZupplyChain';
                req.data.description = 'ZupplyChain Offers A Transparent & Trustworthy Platform For Registering, Searching & Hiring Available Warehouse Space For Palletised Storage. Visit Now!'
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