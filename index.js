//var express = require('express');
//var app = express();
//var port = 3000;
//
//app.use(express.static(__dirname + '/public'));
//
//app.get('/', function(req, res){
//	res.sendFile(__dirname + '/index.html');
//});
//
//app.listen(port, function(){
//	console.log('server start ' + port);
//})

var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files


app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});