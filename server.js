var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var load = require('./app/load');
var cookieParser = require('cookie-parser');
var db = require('./app/data/db');
var session = require('express-session');
var crypto = require('crypto');
var config = require('./app/local.config');
var data={};
var random = Math.random()*100;
random = random.toString();
data.live=false;
var port = 8080;
var bind_address = "localhost";
var live_port = 80;
var live_bind_address = "46.20.238.210";

process.argv.forEach(function (val, index, array) {
	if(val.toLowerCase() ==='live' || val.toLowerCase() ==="prod"){
		data.live=true;
        port = live_port;
        bind_address = live_bind_address;
		console.log('live');
	}
});

app.set('view engine', 'ejs');
// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
//Set the session object and set the secret value to a sha256 message digest
//Must specify resave and saveUninitialized, it is depreciated otherwise
app.use(session({secret: crypto.createHash('sha256').update(random).digest("hex"),
				 resave: true,
				 saveUninitialized: true
				 }));
// parse application/json 
app.use(bodyParser.json());

app.use(express.static(__dirname));

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

require('./app/routes/user-handler')(app);
require('./app/routes/warehouse-handler')(app);
require('./app/routes/registration')(app);
require('./app/routes/search')(app);
require('./app/routes/dashboard')(app);
require('./app/routes/error')(app);
db.init();
console.log("starting node server, you'll see 'listening' on the next line if it was a success:")
app.listen(port, bind_address, function() {
        console.log("listening... go to localhost:" + port);
});
    