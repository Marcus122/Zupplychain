var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var load = require('./app/load');
var cookieParser = require('cookie-parser');
var db = require('./app/data/db');
var session = require('express-session');
var crypto = require('crypto');
var data={};
var random = Math.random()*100;
random = random.toString();
data.live=false;

process.argv.forEach(function (val, index, array) {
	if(val==='live'){
		data.live=true;
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
app.listen(8080);
console.log("listening... go to localhost:8080");