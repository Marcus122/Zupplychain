var emailer = require('../controllers/emailer.js');
var local = require("../local.config.js");
var handler = function(app) {
	app.post('/send-email',function(req,res){
		res.render('emails/contact-us',req.body,req.data,function(err,template){
			if (!err){
				emailer.sendMail(req,res,template,'matthew.alton@weaveability.com',req.body.email,req.body['your-enquiry'],function(err){
					if(err){
						setResponse('Error: Request not sent',res,true);
					}else{
						setResponse('Success: Request sent',res,false);
					}
				});
			}else{
				setResponse('Error: Request not sent',res,true);
			}
		})
	});
	
    app.get('/contact-us', function (req,res) {
        req.data.config = local.config;
		res.render("contact-us",req.data);
	});
};

function setResponse(message,res,err){
	res.writeHead(200, {"Content-Type": "application/json"});
    var output = { error: err, data: message };
    res.end(JSON.stringify(output) + "\n");
}
module.exports = handler;