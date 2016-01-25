var local = require("../local.config.js");

var handler = function(app) {
	app.get('/news', function(req,res){
        req.data.pageTitle = 'Latest News | Warehouse Pallet Storage Space | ZupplyChain';
        req.data.description = 'ZupplyChain Is Constantly Innovating To Provide The Best Warehouse Storage Space Platform - Keep Posted With All Our Logistics And Supply Chain News!';
		req.data.id = undefined
		res.render("news",req.data);
	});
	app.get('/news-post-:id', function(req,res){
        switch(req.params.id) {
            case '1':
                req.data.pageTitle = 'ZupplyChain Launched | Pallet Warehouse Storage Space';
                req.data.description = 'Zupplychain - A Brand New B2B Website To Match Warehouse Space With Pallets Needing Storage - Has Been Launched Today!';
                break;
            case '2':
                req.data.pageTitle = 'ZupplyChain - How It Works | Pallet Warehouse Storage Space';
                req.data.description = 'Zupplychain Is A B2B Portal For Storage Providers & Customers - Not Only Helping Them Find Each Other But Enabling The Whole Relationship & Contract Online!';
                break;
            case '3':
                req.data.pageTitle = 'ZupplyChain Launches Ad Campaign To Recruit Storage Providers';
                req.data.description = 'Zupplychain - Recently Launched B2B Portal Offering Pallets For Space & Space For Pallets - Has Launched A Significant 12 Month Advertising & Marketing Campaign.';
                break;
            default:
                req.data.pageTitle = 'Latest News | Warehouse Pallet Storage Space | ZupplyChain';
                req.data.description = 'ZupplyChain Is Constantly Innovating To Provide The Best Warehouse Storage Space Platform - Keep Posted With All Our Logistics And Supply Chain News!';
                break;
        }
		req.data.id = req.params.id;
		res.render("news",req.data);
	});
};

module.exports = handler;