var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db/users.db');

var users = [];
var connections = [];

app.set('port', (process.env.PORT || 3000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

var sql = 'CREATE TABLE IF NOT EXISTS users (username TEXT, password TEXT)';

db.run(sql, function (error, statement){
	if(error){
		console.log('error', error);
	}
})

app.post('/users/register', function(req, res){
	console.log('new user credits body', req.body);
	console.log('new user username', req.body.username);
	
	db.all("SELECT * FROM users WHERE username=$1", [req.body.username], function(err, rows){
		console.log('get user by username', rows);
		if(rows==""){
			console.log('allo user');
			db.run("INSERT INTO users (username, password) VALUES (?,?)", [req.body.username, req.body.password], function(error, rows){
				if (error) throw error;
				console.log("User added.");
				res.json({status: 200});
			});
		}else{
			res.json({status:403});
		}
	})

});

var currentUser;

app.get('/users/signin/:username', function(req, res){
//	console.log('get user by username', req.params);
	db.all("SELECT * FROM users WHERE username=$1", [req.params.username], function(err, rows){
		console.log('get user by username', rows);
		currentUser = rows;
	})
	console.log(currentUser);
	if(currentUser){
		if(currentUser.password == req.params.password){
			res.json({status: 200});
		}
	}else{
		res.json({status:404});
	}	
});

var usersList=[];

app.get('/users/userslist', function(req, res){
	db.all("SELECT * FROM users", function(err, rows){
		usersList = rows;
		console.log('list of users', usersList);
		res.json({usersList});
	})
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

http.listen(app.get('port'), function(){
  console.log('server start on port', app.get('port'));
});