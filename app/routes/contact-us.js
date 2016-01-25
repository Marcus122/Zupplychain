var emailer = require('../controllers/emailer.js');
var local = require("../local.config.js");
var RegisterForUpdates = require('../controllers/register-for-updates.js');
var handler = function(app) {
	app.post('/send-email',function(req,res){
		req.data.title = 'Contact Us';
		req.data.subtitle = 'Contact Us';
		req.data.companyName = req.body["company-name"];
		req.data.name = req.body.name;
		req.data.telephone = req.body.telephone;
		req.data.requestCallback = req.body["request-callback"];
		req.data.message = req.body.message;
		req.data.mailto = req.body.email;
		req.data.subject = local.config.contactUsEnquires[parseInt(req.body['your-enquiry'])]
        req.data.prothost = req.protocol + '://' + req.headers.host;
		res.render('emails/contact-us',req.data,function(err,template){
			if (!err){
				emailer.sendMail(req,res,template,process.env.NODEMAILER_EMAIL_ADDRESS,req.body.email,req.body['your-enquiry'],function(err){
					if(err){
						setResponse('Error: Request not sent',res,true);
					}else{
						if(req.body['your-enquiry'] === 'Register for Updates'){
							RegisterForUpdates.saveData(req.body.name,req.body["company-name"],req.body.email,req.body.telephone,function(err){
								if(err){
									setResponse('Error: Request not sent',res,true);
								}else{
									setResponse('Success: Request sent',res,false);
								}
							});
						}else{
							setResponse('Success: Request sent',res,false);
						}
					}
				});
			}else{
				setResponse('Error: Request not sent',res,true);
			}
		})
	});
	
    app.get('/contact-us', function (req,res) {
        req.data.config = local.config;
        req.data.pageTitle = 'Contact Us | Pallet Space Rental | Warehouse Storage | ZupplyChain';
        req.data.description = 'ZupplyChain Is A Protected Marketplace For Registering, Searching & Hiring Available Warehouse Space For Palletised Storage. Contact Us Now!';
		res.render("contact-us",req.data);
	});
};

function setResponse(message,res,err){
	res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: err, data: message };
    res.end(JSON.stringify(output) + "\n");
}
module.exports = handler;