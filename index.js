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

//users Sockets

let userSockets = io.of('/');

var users= [];
userSockets.on('connection', function (socket) {
//introducem clientul in cients
	socket.on('storeClientInfo', function (data) {
		console.log(data);
		var userInfo = new Object();
		userInfo.customId     = data.customId;
		userInfo.clientId     = socket.id;
		users.push(userInfo);
	});


    socket.on('disconnect', function(){
//stergem clientul din sesiunea curenta
      for( var i=0, len=clients.length; i<len; ++i ){
          var currentClient = clients[i];

          if(currentClient.clientId == socket.id){//client id-ul reprezinta id-ul socketului implicita
              clients.splice(i,1);
              break;
          }
      }
    });
});



//buses sockets
let busesSockets = io.of('/bus');
var buses =[];
busesSockets.on('connection', function (socket) {
//bagam autobuzele in busses dupa ce se logheaza
	socket.on('storeClientInfo', function (data) {
		console.log(data);
		var busInfo = new Object();
		busInfo.customId     = data.customId;
		busInfo.clientId     = socket.id;
		buses.push(busInfo);
	});
 
  socket.on('disconnect', function(){
//scoatem autobuzele din sesiunea curenta la deconectare
	  for( var i=0, len=buses.length; i<len; ++i ){
	var currentBus = buses[i];
	if(currentBus.clientId == socket.id){//client id-ul reprezinta id-ul socketului implicita
		buses.splice(i,1);
		break;
	}
}

    });


      
  });