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
app.get('*', function(req, res) {
    console.log("connection: GET " + req.path);
    if (req.path.indexOf(".html") == -1) {
        var path =  req.path + '.html';
        res.redirect(path);
    } else {
        res.redirect('/');
    }
});
app.post('*', function(req, res) {
    console.log("connection: POST " + req.path);
	var path =  req.path + '.html';
    res.redirect(path);
});
app.listen(8080);
console.log("listening... go to localhost:8080");