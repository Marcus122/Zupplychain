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

var dbInstance = db.init();
//Set the session object and set the secret value to a sha256 message digest
//Must specify resave and saveUninitialized, it is depreciated otherwise

app.use(session({secret: "mysecret", /*crypto.createHash('sha256').update(random).digest("hex"),*/
				 resave: true,
				 saveUninitialized: true,
                 store: new mongostore({ mongooseConnection: dbInstance })
				 }));
                 
// parse application/json 
app.use(bodyParser.json());

app.use(express.static(__dirname, { maxAge: 86400000 })); //24 hours

app.use(function(req, res, next){
	res.locals.session = req.session;
	res.locals.url = req.protocol + '://' + req.get('host') + req.originalUrl;
	next()
});

//Load session
app.use(load(data));

app.get('/demo', function (req,res) {
    res.render("demo",req.data);
});

app.get("/" , function(req,res){
   res.render("index", req.data);
});

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
    