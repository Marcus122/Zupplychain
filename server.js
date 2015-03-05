var express = require('express');
var app = express();

app.use(express.static(__dirname));
app.get('*', function(req, res) {
	var path =  req.path + '.html';
    res.redirect(path);
});
app.post('*', function(req, res) {
	var path =  req.path + '.html';
    res.redirect(path);
});
app.listen(8080);