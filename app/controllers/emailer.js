var nodemailer = require('nodemailer');
var fh = require('../controllers/file-handler.js');
var Quote = require("../controllers/quote.js");
exports.version = "0.1.0";

//At the moment this is just testing sending a html emails with node
exports.buildTransporter = function(req,res,cb){
	var transporter = nodemailer.createTransport(process.env.NODEMAILER_TRANSPORT_PROTOCOL,{
		service: process.env.NODEMAILER_SERVICE,
		auth: {
			user: process.env.NODEMAILER_EMAIL_ADDRESS,
			pass: process.env.NODEMAILER_PASSWORD
		}
	});
	
	cb(transporter);
}

exports.sendMail = function(req,res,emailTemplate,receiver,from,subject,cb){
		
	var html = emailTemplate;
	var mailOptions = {
		from:    'Zupplychain <info@zupplychain.com>',
		to:      receiver,
		subject: subject,
		html:    html,
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
}