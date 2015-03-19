var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan')

app.set('view engine', 'ejs');
// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json 
app.use(bodyParser.json());

app.use(express.static(__dirname));

app.use(morgan('combined'));

app.get('/test', function (req,res) {
    console.log("testing render with EJS");
    res.render("index");
});

app.get('/provider-registration', function(req,res){
    res.render("provider-registration");
});
app.get('/provider-registration/:step', function (req,res) {
    if (req.params.step == 0) {
        res.render("provider-registration");
    } else {
        res.render("provider-registration" + "-" + req.params.step);
    }
});


app.get('*', function(req, res) {
    try {
        res.render(req.path.substring(1, req.path.length)); //strip leading '/'
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
app.listen(8080);
console.log("listening... go to localhost:8080");