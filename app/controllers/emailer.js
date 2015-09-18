var nodemailer = require('nodemailer');
var fh = require('../controllers/file-handler.js');
var Quote = require("../controllers/quote.js");
exports.version = "0.1.0";
//At the moment this is just testing sending a html emails with node
exports.buildTransporter = function(req,res,cb){
	
	fh.readFile('./secret.json',function(err,data){
		if (err){
			//Do something
		}else{
			var json = JSON.parse(data);
			var transporter = nodemailer.createTransport("SMTP",{
				service: "Hotmail",
				auth: {
					user: "matt_alton13@hotmail.co.uk",
					pass: json.hotmailPassword
				}
			});
			
			cb(transporter);
			}
	})	
}

exports.sendMail = function(req,res,emailTemplate,receiver,subject,cb){
	Quote.getById('55fc27f5858766240980bc4e',function(err,quote){
		req.data.quote = quote;
		res.render('emails/provider-request',req.data,function(err,viewString){
			var html = viewString;
		var mailOptions = {
		from:    'no-reply@zupplychain.com',
		to:      receiver,
		subject: subject,
		html:    html
		}
	
	exports.buildTransporter(req,res,function(transporter){
		transporter.sendMail(mailOptions,function(err,info){
			if (err){
				console.log(err);
				cb(err);
			}else{
				cb(null);
			}
		});
	});
		});
	});
	
}