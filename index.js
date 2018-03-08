const express = require('express'),
	app = express(),
	server = require('http').Server(app),
	fs = require('fs'),
	url = require('url'),
	mySql = require('mysql'),
	port = process.env.PORT || 3000;

const io = require('socket.io')(server);

server.listen(port);

var con = mySql.createConnection({
  host: "sulnwdk5uwjw1r2k.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "zjkmgixo5uc7x674",
  password: "q8g7itf4lyccen2a",
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.use('/public', express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));
app.use('/scripts', express.static(__dirname + '/node_modules'));

app.get('/', (req, res) => {
	res.type('text/html');


	fs.readFile('views/start.html', (error, data) => {
		if (error) {
			throw error;
		}

		res.send(data);
	});
	
});

let userSockets = io.of('/'), usersCount = 0;

userSockets.on('connection', function (socket) {
	console.log("Un fraier s-a conectat");

  	socket.emit('news', { hello: 'world' });

  	socket.on('my other event', function (data) {
  		usersCount++;
    	console.log(usersCount);
    });

    socket.on('disconnect', function(){
    	usersCount--;
    	console.log(usersCount);
    });
});