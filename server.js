var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var load = require('./app/load');
var cookieParser = require('cookie-parser');
var db = require('./app/data/db');
var data={};
data.live=false;

process.argv.forEach(function (val, index, array) {
	if(val==='live'){
		data.live=true;
		console.log('live');
	}
});

app.set('view engine', 'ejs');
// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
// parse application/json 
app.use(bodyParser.json());

app.use(express.static(__dirname));

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