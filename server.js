var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var load = require('./app/load');
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
var bind_address = "0.0.0.0";
var live_port = 80;
var live_bind_address = "46.20.238.210";

process.argv.forEach(function (val, index, array) {
	if(val.toLowerCase() ==='live' || val.toLowerCase() ==="prod"){
		data.live=true;
        port = live_port;
        bind_address = live_bind_address;
		console.log('live - JS and CSS using built versions, binding server to external IP');
		
		app.engine('ejs',function(filePath,options,callback){
			ejs.__express(filePath,options,function(err,html){
				if(err) return callback(err)
				callback(null,minify(html,{
					removeComments:true,
					collapseWhitespace:true
				}))
			});
		});
	
	} else if (val.toLowerCase() ==='qa') {
        data.live=true;// live versions of JS and CSS
        //but bind addresses etc stay the same.
        console.log("QA - JS and CSS using built versions");
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
				 httpOnly:true
				 }));
                 
// parse application/json 
app.use(bodyParser.json());

app.use(express.static(__dirname, { maxAge: 86400000 })); //24 hours

//Load session
app.use(load(data));

app.use(csurf());

//Utils.startProviderContactListReminderCronJob(app);

app.use(function(req, res, next){
	res.locals.session = req.session;
	res.locals.url = req.protocol + '://' + req.get('host') + req.originalUrl;
	res.locals.csrfTokenFunction = req.csrfToken;
	if(req.url == '/favicon.ico'){
		res.writeHead(200, {'Content-Type': 'image/x-icon'} );
		res.end();
	}else{
		next()
	}
});

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


console.log("starting node server, you'll see 'listening' on the next line if it was a success:")
app.listen(port, bind_address, function() {
        console.log("listening... go to localhost:" + port);
});
    