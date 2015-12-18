var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var load = require('./app/load');
var init = require('./app/init');
var cookieParser = require('cookie-parser');
var db = require('./app/data/db');
var session = require('express-session');
var mongostore = require("connect-mongo")(session);
var crypto = require('crypto');
var config = require('./app/local.config');
var compression = require('compression');
var helmet = require('helmet');
var csurf = require('csurf');
var ejs = require('ejs');
var minify = require('html-minifier').minify;
var Utils = require('./app/utils.js');
var data={};
var random = Math.random()*100;
random = random.toString();
data.live=false;
var port = 8081;
var http_port = 80
var bind_address = "0.0.0.0";
var live_port = 443;
var live_bind_address = "46.20.238.210";
var system;
var options;
var secure;

process.argv.forEach(function (val, index, array) {
	if(val.toLowerCase() ==='live' || val.toLowerCase() ==="prod"){
		data.live=true;
		data.secure = true;
        port = live_port;
        bind_address = live_bind_address;
		system = val.toLowerCase();
		console.log('live - JS and CSS using built versions, binding server to external IP');
		
		// app.engine('ejs',function(filePath,options,callback){
		// 	ejs.__express(filePath,options,function(err,html){
		// 		if(err) return callback(err)
		// 		callback(null,minify(html,{
		// 			removeComments:true,
		// 			collapseWhitespace:true,
		// 			preserveLineBreaks:true
		// 		}))
		// 	});
		// });
		
		var fs = require("fs");
		var ca = []
		var chain = fs.readFileSync("../../etc/pki/tls/certs/positivessl-bundle.crt", 'utf8');
		chain = chain.split('\n');
		var cert = [];
		var line;
		for(var i = 0, len = chain.length; i < len; i++){
			line = chain[i]
			if(!(line.length !== 0)){
				continue;
			}
			cert.push(line);
			if(line.match(/-END CERTIFICATE-/)){
				ca.push(cert.join("\n"))
				cert = []
			}
		}
		options = {
			key: fs.readFileSync("../../etc/pki/tls/private/zupplychain.com.key"),
			cert: fs.readFileSync("../../etc/pki/tls/certs/zupplychain.com.crt"),
			ca: ca
		}
		
		app.use(helmet.contentSecurityPolicy({upgradeInsecureRequests:""}));
		secure = true;
	
	} else if (val.toLowerCase() ==='qa') {
        data.live=true;// live versions of JS and CSS
        //but bind addresses etc stay the same.
        console.log("QA - JS and CSS using built versions");
		system = val.toLowerCase();
	}else{
		system = val.toLowerCase();
		secure = false;
	}
});

app.set('view engine', 'ejs');
// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: true }));

app.use(compression());//

app.use(cookieParser());

app.use(helmet());
app.use(helmet.xssFilter({ setOnOldIE: true })); //XSS Protection
app.use(helmet.frameguard('sameorigin')); //Only allow this site to be framed from the same origin
app.use(helmet.hidePoweredBy());//Hide the powered by Express in the header
app.use(helmet.ieNoOpen());//Stop IE from downloading unsecure HTML from the site
app.use(helmet.noSniff());//Stop browsers from sniffing mime types
app.use(helmet.noCache({ noEtag: true }));//Stops caching of JS etc. So users can't exploit buggy code.

var dbInstance = db.init();
//Set the session object and set the secret value to a sha256 message digest
//Must specify resave and saveUninitialized, it is depreciated otherwise

app.use(session({secret: crypto.createHash('sha256').update(random).digest("hex"),
				 resave: true,
				 saveUninitialized: true,
                 store: new mongostore({ mongooseConnection: dbInstance }),
				 httpOnly:true,
				 cookie:{secure:secure}
				 }));
                 
// parse application/json 
app.use(bodyParser.json());

app.use(express.static(__dirname, { maxAge: 86400000 })); //24 hours

//Load session
app.use(load(data));

app.use(csurf());

//Utils.startProviderContactListReminderCronJob(app);

app.use(init(data));
app.get('/demo', function (req,res) {
    res.render("demo",req.data);
});

app.get("/" , function(req,res){
   res.render("index", req.data);
});

require('./app/routes/contact-us')(app);
require('./app/routes/user-handler')(app);
require('./app/routes/warehouse-handler')(app);
require('./app/routes/registration')(app);
require('./app/routes/search')(app);
require('./app/routes/quote')(app);
require('./app/routes/dashboard')(app);
require('./app/routes/news')(app);
require('./app/routes/static')(app);
require('./app/routes/error')(app);


if (system === 'live' || system ==="prod"){
	var https = require('https');
	app.use(helmet.hsts({
	  maxAge: 31536000000,
	  includeSubdomains: true,
	  force : true
	}));
	var server = https.createServer(options,app);
	server.listen(port,bind_address);
	port = http_port;
}

console.log("starting node server, you'll see 'listening' on the next line if it was a success:")
app.listen(port, bind_address, function() {
		console.log("listening... go to localhost:" + port);
});
    