// Copyright Epic Games, Inc. All Rights Reserved.

//-- Server side logic. Serves pixel streaming WebRTC-based page, proxies data back to Streamer --//

var express = require('express');
var app = express();

const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const bodyParser = require('body-parser');
const logging = require('./modules/logging.js');
logging.RegisterConsoleLogger();

// Command line argument --configFile needs to be checked before loading the config, all other command line arguments are dealt with through the config object

const defaultConfig = {
	UseFrontend: false,
	UseMatchmaker: false,
	UseHTTPS: false,
	UseAuthentication: false,
	LogToFile: true,
	HomepageFile: 'player.htm',
	AdditionalRoutes: new Map()
};

const argv = require('yargs').argv;
var configFile = (typeof argv.configFile != 'undefined') ? argv.configFile.toString() : '.\\config.json';
console.log(`configFile ${configFile}`);
const config = require('./modules/config.js').init(configFile, defaultConfig);

if (config.LogToFile) {
	logging.RegisterFileLogger('./logs');
}

console.log("Config: " + JSON.stringify(config, null, '\t'));

var http = require('http').Server(app);

var sessionMonitor = require('./modules/sessionMonitor.js');
sessionMonitor.init();

if (config.UseHTTPS) {
	//HTTPS certificate details
	const options = {
		key: fs.readFileSync(path.join(__dirname, './certificates/client-key.pem')),
		cert: fs.readFileSync(path.join(__dirname, './certificates/client-cert.pem'))
	};

	var https = require('https').Server(options, app);
}

//If not using authetication then just move on to the next function/middleware
var isAuthenticated = redirectUrl => function (req, res, next) { return next(); }

if (config.UseAuthentication && config.UseHTTPS) {
	var passport = require('passport');
	require('./modules/authentication').init(app);
	// Replace the isAuthenticated with the one setup on passport module
	isAuthenticated = passport.authenticationMiddleware ? passport.authenticationMiddleware : isAuthenticated
} else if (config.UseAuthentication && !config.UseHTTPS) {
	console.error('Trying to use authentication without using HTTPS, this is not allowed and so authentication will NOT be turned on, please turn on HTTPS to turn on authentication');
}

const helmet = require('helmet');
var hsts = require('hsts');
var net = require('net');

var FRONTEND_WEBSERVER = 'https://localhost';
if (config.UseFrontend) {
	var httpPort = 3000;
	var httpsPort = 8000;

	//Required for self signed certs otherwise just get an error back when sending request to frontend see https://stackoverflow.com/a/35633993
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

	const httpsClient = require('./modules/httpsClient.js');
	var webRequest = new httpsClient();
} else {
	var httpPort = 80;
	var httpsPort = 443;
}

var streamerPort = 8888; // port to listen to Streamer connections

var matchmakerAddress = '127.0.0.1';
var matchmakerPort = 9999;
var matchmakerRetryInterval = 5;

var gameSessionId;
var userSessionId;
var serverPublicIp;

// `clientConfig` is send to Streamer and Players
// Example of STUN server setting
// let clientConfig = {peerConnectionOptions: { 'iceServers': [{'urls': ['stun:34.250.222.95:19302']}] }};
var clientConfig = { type: 'config', peerConnectionOptions: {} };

// Parse public server address from command line
// --publicIp <public address>
try {
	if (typeof config.publicIp != 'undefined') {
		serverPublicIp = config.publicIp.toString();
	}

	if (typeof config.httpPort != 'undefined') {
		httpPort = config.httpPort;
	}

	if (typeof config.httpsPort != 'undefined') {
		httpsPort = config.httpsPort;
	}

	if (typeof config.streamerPort != 'undefined') {
		streamerPort = config.streamerPort;
	}

	if (typeof config.frontendUrl != 'undefined') {
		FRONTEND_WEBSERVER = config.frontendUrl;
	}

	if (typeof config.peerConnectionOptions != 'undefined') {
		clientConfig.peerConnectionOptions = JSON.parse(config.peerConnectionOptions);
		console.log(`peerConnectionOptions = ${JSON.stringify(clientConfig.peerConnectionOptions)}`);
	}

	if (typeof config.matchmakerAddress != 'undefined') {
		matchmakerAddress = config.matchmakerAddress;
	}

	if (typeof config.matchmakerPort != 'undefined') {
		matchmakerPort = config.matchmakerPort;
	}

	if (typeof config.matchmakerRetryInterval != 'undefined') {
		matchmakerRetryInterval = config.matchmakerRetryInterval;
	}
} catch (e) {
	console.error(e);
	process.exit(2);
}

if (config.UseHTTPS) {
	app.use(helmet());

	app.use(hsts({
		maxAge: 15552000  // 180 days in seconds
	}));

	//Setup http -> https redirect
	console.log('Redirecting http->https');
	app.use(function (req, res, next) {
		if (!req.secure) {
			if (req.get('Host')) {
				var hostAddressParts = req.get('Host').split(':');
				var hostAddress = hostAddressParts[0];
				if (httpsPort != 443) {
					hostAddress = `${hostAddress}:${httpsPort}`;
				}
				return res.redirect(['https://', hostAddress, req.originalUrl].join(''));
			} else {
				console.error(`unable to get host name from header. Requestor ${req.ip}, url path: '${req.originalUrl}', available headers ${JSON.stringify(req.headers)}`);
				return res.status(400).send('Bad Request');
			}
		}
		next();
	});
}

sendGameSessionData();

//Setup the login page if we are using authentication
if(config.UseAuthentication){
	app.get('/login', function(req, res){
		res.sendFile(__dirname + '/login.htm');
	});

	// create application/x-www-form-urlencoded parser
	var urlencodedParser = bodyParser.urlencoded({ extended: false })

	//login page form data is posted here
	app.post('/login', 
		urlencodedParser, 
		passport.authenticate('local', { failureRedirect: '/login' }), 
		function(req, res){
			//On success try to redirect to the page that they originally tired to get to, default to '/' if no redirect was found
			var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/';
			delete req.session.redirectTo;
			console.log(`Redirecting to: '${redirectTo}'`);
			res.redirect(redirectTo);
		}
	);
}

//Setup folders
app.use(express.static(path.join(__dirname, '/public')))
app.use('/images', express.static(path.join(__dirname, './images')))
app.use('/scripts', [isAuthenticated('/login'),express.static(path.join(__dirname, '/scripts'))]);
app.use('/', [isAuthenticated('/login'), express.static(path.join(__dirname, '/custom_html'))])

try {
	for (var property in config.AdditionalRoutes) {
		if (config.AdditionalRoutes.hasOwnProperty(property)) {
			console.log(`Adding additional routes "${property}" -> "${config.AdditionalRoutes[property]}"`)
			app.use(property, [isAuthenticated('/login'), express.static(path.join(__dirname, config.AdditionalRoutes[property]))]);
		}
	}
} catch (err) {
	console.error(`reading config.AdditionalRoutes: ${err}`)
}

app.get('/', isAuthenticated('/login'), function (req, res) {
	homepageFile = (typeof config.HomepageFile != 'undefined' && config.HomepageFile != '') ? config.HomepageFile.toString() : defaultConfig.HomepageFile;
	homepageFilePath = path.join(__dirname, homepageFile)

	fs.access(homepageFilePath, (err) => {
		if (err) {
			console.error('Unable to locate file ' + homepageFilePath)
			res.status(404).send('Unable to locate file ' + homepageFile);
		}
		else {
			res.sendFile(homepageFilePath);
		}
	});
});


//Setup http and https servers
http.listen(httpPort, function () {
	console.logColor(logging.Green, 'Http listening on *: ' + httpPort);
});

if (config.UseHTTPS) {
	https.listen(httpsPort, function () {
		console.logColor(logging.Green, 'Https listening on *: ' + httpsPort);
	});
}

/*
app.get('/:sessionId', isAuthenticated('/login'), function(req, res){
	let sessionId = req.params.sessionId;
	console.log(sessionId);
	
	//For now don't verify session id is valid, just send player.htm if they get the right server
  res.sendFile(__dirname + '/player.htm');
});
*/

/* 
app.get('/custom_html/:htmlFilename', isAuthenticated('/login'), function(req, res){
	let htmlFilename = req.params.htmlFilename;
	
	let htmlPathname = __dirname + '/custom_html/' + htmlFilename;

	console.log(htmlPathname);
	fs.access(htmlPathname, (err) => {
		if (err) {
			res.status(404).send('Unable to locate file ' + htmlPathname);
		}
		else {
			res.sendFile(htmlPathname);
		}
	});
});
*/

let WebSocket = require('ws');

let streamerServer = new WebSocket.Server({ port: streamerPort, backlog: 1 });
console.logColor(logging.Green, `WebSocket listening to Streamer connections on :${streamerPort}`)
let streamer; // WebSocket connected to Streamer

streamerServer.on('connection', function (ws, req) {
	console.logColor(logging.Green, `Streamer connected: ${req.connection.remoteAddress}`);

	ws.on('message', function(msg) {
		console.logColor(logging.Blue, msg);
	// // BEGIN CHECKING INPUTS FOR SCRATCH

		try {
			msg = JSON.parse(msg);
		} catch(err) {
			console.error(`cannot parse Streamer message: ${msg}\nError: ${err}`);
			streamer.close(1008, 'Cannot parse');
			return;
		}
		
		let playerId = msg.playerId;
		delete msg.playerId; // no need to send it to the player
		let player = players.get(playerId);
		if (!player) {
			console.log(`dropped message ${msg.type} as the player ${playerId} is not found`);
			return;
		}

		if (msg.type == 'answer') {
			player.ws.send(JSON.stringify(msg));
		} else if (msg.type == 'iceCandidate') {
			player.ws.send(JSON.stringify(msg));
		} else if (msg.type == 'disconnectPlayer') {
			player.ws.close(1011 /* internal error */, msg.reason);
		} else {
			// console.error(`unsupported Streamer message type: ${msg.type}`);
			// streamer.close(1008, 'Unsupported message type');
			console.log('first one chief');
		}
	});

	function onStreamerDisconnected() {
		disconnectAllPlayers();
	}
	
	ws.on('close', function(code, reason) {
		console.error(`streamer disconnected: ${code} - ${reason}`);
		onStreamerDisconnected();
	});

	ws.on('error', function(error) {
		console.error(`streamer connection error: ${error}`);
		ws.close(1006 /* abnormal closure */, error);
		onStreamerDisconnected();
	});

	streamer = ws;

	streamer.send(JSON.stringify(clientConfig));
});

let playerServer = new WebSocket.Server({ server: config.UseHTTPS ? https : http});
console.logColor(logging.Green, `WebSocket listening to Players connections on :${httpPort}`)

let players = new Map(); // playerId <-> player, where player is either a web-browser or a native webrtc player
let nextPlayerId = 100;

playerServer.on('connection', function (ws, req) {
	// Reject connection if streamer is not connected
	if (!streamer || streamer.readyState != 1 /* OPEN */) {
		ws.close(1013 /* Try again later */, 'Streamer is not connected');
		return;
	}

	let playerId = ++nextPlayerId;
	console.log(`player ${playerId} (${req.connection.remoteAddress}) connected`);
	players.set(playerId, { ws: ws, id: playerId });

	function sendPlayersCount() {
		let playerCountMsg = JSON.stringify({ type: 'playerCount', count: players.size });
		for (let p of players.values()) {
			p.ws.send(playerCountMsg);
		}
	}
	
	ws.on('message', function (msg) {
		console.logColor(logging.Blue, `<- player ${playerId}: ${msg}`);

		try {
			msg = JSON.parse(msg);
		} catch (err) {
			console.error(`Cannot parse player ${playerId} message: ${err}`);
			ws.close(1008, 'Cannot parse');
			return;
		}

		if (msg.type == 'offer') {
			console.log(`<- player ${playerId}: offer`);
			msg.playerId = playerId;
			streamer.send(JSON.stringify(msg));
		} else if (msg.type == 'iceCandidate') {
			console.log(`<- player ${playerId}: iceCandidate`);
			msg.playerId = playerId;
			streamer.send(JSON.stringify(msg));
		} else if (msg.type == 'stats') {
			console.log(`<- player ${playerId}: stats\n${msg.data}`);
		} else if (msg.type == 'kick') {
			let playersCopy = new Map(players);
			for (let p of playersCopy.values()) {
				if (p.id != playerId) {
					console.log(`kicking player ${p.id}`)
					p.ws.close(4000, 'kicked');
				}
			}
		} else {
			let scratch_check = msg.scratch;
			let msg2 = scratch_check; 	// copying just incase
			let test = msg2.slice(0, 7);
			if (test == 'scratch'){     // if its a message from scratch then display on console

				console.logColor(logging.Yellow, 'scratch received');
				// -------------- 	SEND MESSAGE OUT TO HTML (UNSURE YET) -------------------
				// streamerServer.clients.forEach((client) => {
				// 	client.send(msg.slice(8));
				// });
				//--------------------------------------------------------------------------
			}
			else{
				console.log('we are close?');
			}
			// console.error(`<- player ${playerId}: unsupported message type: ${msg.type}`);
			// ws.close(1008, 'Unsupported message type');
			// return;
		}
	});

	function onPlayerDisconnected() {
		players.delete(playerId);
		streamer.send(JSON.stringify({type: 'playerDisconnected', playerId: playerId}));
		sendPlayerDisconnectedToFrontend();
		sendPlayerDisconnectedToMatchmaker();
		sendPlayersCount();
	}

	ws.on('close', function(code, reason) {
		console.logColor(logging.Yellow, `player ${playerId} connection closed: ${code} - ${reason}`);
		onPlayerDisconnected();
	});

	ws.on('error', function(error) {
		console.error(`player ${playerId} connection error: ${error}`);
		ws.close(1006 /* abnormal closure */, error);
		onPlayerDisconnected();
	});

	sendPlayerConnectedToFrontend();
	sendPlayerConnectedToMatchmaker();

	ws.send(JSON.stringify(clientConfig));

	sendPlayersCount();
});

function disconnectAllPlayers(code, reason) {
	let clone = new Map(players);
	for (let player of clone.values()) {
		player.ws.close(code, reason);
	}
}

/**
 * Function that handles the connection to the matchmaker.
 */

if (config.UseMatchmaker) {
	var matchmaker = new net.Socket();

	matchmaker.on('connect', function() {
		console.log(`Cirrus connected to Matchmaker ${matchmakerAddress}:${matchmakerPort}`);
		message = {
			type: 'connect',
			address: typeof serverPublicIp === 'undefined' ? '127.0.0.1' : serverPublicIp,
			port: httpPort
		};
		matchmaker.write(JSON.stringify(message));
	});

	matchmaker.on('error', (err) => {
		console.log(`Matchmaker connection error ${JSON.stringify(err)}`);
	});

	matchmaker.on('end', () => {
		console.log('Matchmaker connection ended');
	});

	matchmaker.on('close', (hadError) => {
		console.log(`Matchmaker connection closed (hadError=${hadError})`);
		reconnect();
	});

	// Attempt to connect to the Matchmaker
	function connect() {
		matchmaker.connect(matchmakerPort, matchmakerAddress);
	}

	// Try to reconnect to the Matchmaker after a given period of time
	function reconnect() {
		console.log(`Try reconnect to Matchmaker in ${matchmakerRetryInterval} seconds`)
		setTimeout(function() {
			connect();
		}, matchmakerRetryInterval * 1000);
	}

	connect();
}

//Keep trying to send gameSessionId in case the server isn't ready yet
function sendGameSessionData() {
	//If we are not using the frontend web server don't try and make requests to it
	if (!config.UseFrontend)
		return;

	webRequest.get(`${FRONTEND_WEBSERVER}/server/requestSessionId`,
		function (response, body) {
			if (response.statusCode === 200) {
				gameSessionId = body;
				console.log('SessionId: ' + gameSessionId);
			}
			else {
				console.error('Status code: ' + response.statusCode);
				console.error(body);
			}
		},
		function (err) {
			//Repeatedly try in cases where the connection timed out or never connected
			if (err.code === "ECONNRESET") {
				//timeout
				sendGameSessionData();
			} else if (err.code === 'ECONNREFUSED') {
				console.error('Frontend server not running, unable to setup game session');
			} else {
				console.error(err);
			}
		});
}

function sendUserSessionData(serverPort) {
	//If we are not using the frontend web server don't try and make requests to it
	if (!config.UseFrontend)
		return;

	webRequest.get(`${FRONTEND_WEBSERVER}/server/requestUserSessionId?gameSessionId=${gameSessionId}&serverPort=${serverPort}&appName=${querystring.escape(clientConfig.AppName)}&appDescription=${querystring.escape(clientConfig.AppDescription)}${(typeof serverPublicIp === 'undefined' ? '' : '&serverHost=' + serverPublicIp)}`,
		function (response, body) {
			if (response.statusCode === 410) {
				sendUserSessionData(serverPort);
			} else if (response.statusCode === 200) {
				userSessionId = body;
				console.log('UserSessionId: ' + userSessionId);
			} else {
				console.error('Status code: ' + response.statusCode);
				console.error(body);
			}
		},
		function (err) {
			//Repeatedly try in cases where the connection timed out or never connected
			if (err.code === "ECONNRESET") {
				//timeout
				sendUserSessionData(serverPort);
			} else if (err.code === 'ECONNREFUSED') {
				console.error('Frontend server not running, unable to setup user session');
			} else {
				console.error(err);
			}
		});
}

function sendServerDisconnect() {
	//If we are not using the frontend web server don't try and make requests to it
	if (!config.UseFrontend)
		return;

	webRequest.get(`${FRONTEND_WEBSERVER}/server/serverDisconnected?gameSessionId=${gameSessionId}&appName=${querystring.escape(clientConfig.AppName)}`,
		function (response, body) {
			if (response.statusCode === 200) {
				console.log('serverDisconnected acknowledged by Frontend');
			} else {
				console.error('Status code: ' + response.statusCode);
				console.error(body);
			}
		},
		function (err) {
			//Repeatedly try in cases where the connection timed out or never connected
			if (err.code === "ECONNRESET") {
				//timeout
				sendServerDisconnect();
			} else if (err.code === 'ECONNREFUSED') {
				console.error('Frontend server not running, unable to setup user session');
			} else {
				console.error(err);
			}
		});
}

function sendPlayerConnectedToFrontend() {
	//If we are not using the frontend web server don't try and make requests to it
	if (!config.UseFrontend)
		return;

	webRequest.get(`${FRONTEND_WEBSERVER}/server/clientConnected?gameSessionId=${gameSessionId}&appName=${querystring.escape(clientConfig.AppName)}`,
		function (response, body) {
			if (response.statusCode === 200) {
				console.log('clientConnected acknowledged by Frontend');
			} else {
				console.error('Status code: ' + response.statusCode);
				console.error(body);
			}
		},
		function (err) {
			//Repeatedly try in cases where the connection timed out or never connected
			if (err.code === "ECONNRESET") {
				//timeout
				sendPlayerConnectedToFrontend();
			} else if (err.code === 'ECONNREFUSED') {
				console.error('Frontend server not running, unable to setup game session');
			} else {
				console.error(err);
			}
		});
}

function sendPlayerDisconnectedToFrontend() {
	//If we are not using the frontend web server don't try and make requests to it
	if (!config.UseFrontend)
		return;

	webRequest.get(`${FRONTEND_WEBSERVER}/server/clientDisconnected?gameSessionId=${gameSessionId}&appName=${querystring.escape(clientConfig.AppName)}`,
		function (response, body) {
			if (response.statusCode === 200) {
				console.log('clientDisconnected acknowledged by Frontend');
			}
			else {
				console.error('Status code: ' + response.statusCode);
				console.error(body);
			}
		},
		function (err) {
			//Repeatedly try in cases where the connection timed out or never connected
			if (err.code === "ECONNRESET") {
				//timeout
				sendPlayerDisconnectedToFrontend();
			} else if (err.code === 'ECONNREFUSED') {
				console.error('Frontend server not running, unable to setup game session');
			} else {
				console.error(err);
			}
		});
}

// The Matchmaker will not re-direct clients to this Cirrus server if any client
// is connected.
function sendPlayerConnectedToMatchmaker() {
	if (!config.UseMatchmaker)
		return;

	message = {
		type: 'clientConnected'
	};
	matchmaker.write(JSON.stringify(message));
}

// The Matchmaker is interested when nobody is connected to a Cirrus server
// because then it can re-direct clients to this re-cycled Cirrus server.
function sendPlayerDisconnectedToMatchmaker() {
	if (!config.UseMatchmaker)
		return;

	message = {
		type: 'clientDisconnected'
	};
	matchmaker.write(JSON.stringify(message));
}