const express = require('express'),
	app = express(),
	server = require('http').Server(app),
	fs = require('fs'),
	url = require('url'),
	mySql = require('mysql'),
	bodyParser = require('body-parser'),
	bcrypt = require('bcrypt'),
	cookieSession = require('cookie-session'),
	port = process.env.PORT || 3000;

const io = require('socket.io')(server);

server.listen(port);

var con = mySql.createConnection({
  host: "sulnwdk5uwjw1r2k.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "zjkmgixo5uc7x674",
  password: "q8g7itf4lyccen2a",
  database: "f9q7qmaggj9xbvmq"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


//application resources folders setup
app.use('/public', express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));
app.use('/scripts', express.static(__dirname + '/node_modules'));

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

//cookie-session middleware
app.use(cookieSession(
	{
		name: 'session',
		keys: ['whatever'],
		maxAge: 24 * 60 * 60 * 1000 
	}
));

app.get('/', (req, res) => {
	res.type('text/html');


	fs.readFile('views/start.html', (error, data) => {
		if (error) {
			throw error;
		}

		res.send(data);
	});
	
});

app.get('/busRoutes', (request, response) => {
	con.query("SELECT * FROM bus_routes", function(error, results, fields){
		for (let i = 0; i < results.length; i++) {
			results[i].route_file = JSON.parse(fs.readFileSync('public/route-files/' + results[i].route_file, 'utf8'));
		}
		response.send(results);
	});
});

app.get('/busWatcher', (req, res) => {
	res.type('text/html');

	fs.readFile('views/busWatcher.html', (error, data) => {
		if (error) {
			throw error;
		}

		res.send(data);
	});
});

app.get('/isBusLoggedIn', (request, response) => {

	if (typeof request.session.busData === 'object') {
		if (Object.keys(request.session.busData) == [])
			request.session.busData = undefined;
	}

	response.type('json');

	if (!request.session.busData) {
		response.send(JSON.stringify({STATUS:  'NOT_LOGGED_IN' }));
	}
	else {
		console.log(request.session.busData);

		con.query(
			"SELECT * FROM buses WHERE id=?",
			[request.session.busData.id],
			function(error, results, fields) {
		

				if (results) {
					let busData = results[0];
					busData['STATUS'] = 'LOGGED_IN';
					busData['password'] = undefined;
					response.send(JSON.stringify(busData));
				}

			}
		);

	}

});

app.get('/busLogOut', (request, response) => {
	request.session.busData = undefined;

	response.send({STATUS: "OK"});
});

app.post('/busLogIn', (req, response) => {
	const saltRounds = 10;

	response.type('json');

  	con.query("SELECT * FROM buses WHERE username = ?", [req.body.username], function(error, results, fields){

  		if (results.length === 0) {
  			response.send(JSON.stringify({STATUS: "invalid_username"}));
  		}

  		else {
  			let password = results[0].password;

	  		bcrypt.compare(req.body.password, password, function(err, res) {

	  			if (res === true) {
	  				//insert data to session here
	  				req.session.busData = {id: results[0]['id']};

	  				results[0]['STATUS'] = "logged_in";
	  				response.send(JSON.stringify(results[0]));
	  			}
	  			else {
	  				response.send(JSON.stringify({STATUS: "invalid_password"}));
	  			}
	    		
			});
  		}
  		
  	});

	/*
	bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  		res.send(hash);
	});
	*/
});

//users Sockets
let userSockets = io.of('/'), users= [];

userSockets.on('connection', function (socket) {

	//introducem clientul in cients
	socket.on('storeClientInfo', function (data) {
		console.log(data);
		var userInfo = new Object();
		userInfo.customId     = data.customId;
		userInfo.clientId     = socket.id;
		users.push(userInfo);
	});

	setInterval(() => {
		con.query("SELECT * FROM buses", function(error, results, fields){
			socket.emit('busData', results);
		});
		
	}, 2000);

    socket.on('disconnect', function(){
	//stergem clientul din sesiunea curenta
      for( var i=0, len=users.length; i<len; ++i ){
          var currentClient = users[i];

          if(currentClient.clientId == socket.id){//client id-ul reprezinta id-ul socketului implicita
              users.splice(i,1);
              break;
          }
      }
    });
});



//buses sockets
let busesSockets = io.of('/bus');
var buses =[];

function getLastBusPosition(busId) {
	/*
		Function that gets the last position of a given bus.
		In: busId (int)
		Out: object with the requested data
	*/
}

busesSockets.on('connection', function (socket) {
	//bagam autobuzele in busses dupa ce se logheaza
	socket.on('storeClientInfo', function (data) {
		console.log("Bus logged in.");

		var busInfo = {};
		busInfo.customId = data;
		busInfo.clientId = socket.id;
		buses.push(busInfo);
	});

	socket.on('bus-new-location', function(data){
		console.log(data);
		con.query('UPDATE buses SET current_location_lat = ?, current_location_lng = ?, speed = ?, updated_at = ? WHERE id = ?',
			[data.currentLocationLat, data.currentLocationLng, data.speed, data.currentTime, data.busId],
			function(error, results, fields) {
				console.log(results);
			});
	});
 
  	socket.on('disconnect', function(){
		//scoatem autobuzele din sesiunea curenta la deconectare
		for( var i=0, len = buses.length; i<len; ++i ){
			var currentBus = buses[i];
			if(currentBus.clientId == socket.id){//client id-ul reprezinta id-ul socketului implicita
				buses.splice(i,1);
				break;
	}
}

    });
});
