var express = require('express');
var app = express();
var http = require('http').Server(app);
var io =require('socket.io')(http);
var bodyParser = require('body-parser');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	connections.push(socket);
	console.log('Connected: %s sockets', connections.length);
	
	socket.on('disconnect', function(data){
		users.splice(users.indexOf(socket.username), 1);
		io.sockets.emit('getUsers', users);
		connections.splice(connections.indexOf(socket), 1);
		console.log('Disconnected: %s sockets', connections.length);
	});

	socket.on('sendMessage', function(data){
		console.log(data);
		io.sockets.emit('newMessage', {msg:data, user: socket.username});
	});

	socket.on('newUser', function(data, callback){
		
		callback(true);
		socket.username = data.username;
		socket.password = data.password;
		
		console.log('username on server', socket.username,'password on server', socket.password);
	
	});
});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});