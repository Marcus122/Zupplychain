var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
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

//app.use(morgan('combined'));
//Load session
app.use(load(data));

app.get('/test', function (req,res) {
    console.log("testing render with EJS");
    res.render("index",req.data);
});

app.get('/provider-registration', function(req,res){
    res.render("provider-registration",req.data);
});
app.get('/provider-registration/:step', function (req,res) {
    providerHandler(req,res);
});
app.post('/provider-registration-:step', function (req,res) {
    providerHandler(req,res);
});
require('./routes/user-handler')(app);

function providerHandler(req,res){
	if (req.params.step == 0) {
        res.render("provider-registration",req.data);
    } else {
        res.render("provider-registration" + "-" + req.params.step,req.data);
    }
}

app.get('*', function(req, res) {
    try {
        res.render(req.path.substring(1, req.path.length),req.data); //strip leading '/'
    }
    catch (ex){
        res.status(404).send("404 : page not found");
    }
        
});
app.post('*', function(req, res) {
    console.log("connection: POST " + req.path);
	var path =  req.path + '.html';
    res.redirect(path);
});
db.init();
app.listen(8080);
console.log("listening... go to localhost:8080");