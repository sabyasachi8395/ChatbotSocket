var PORT = process.env.PORT || 3000;
var moment = require('moment');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var prompt = require('prompt-sync')();
var ConversationV1 = require('watson-developer-cloud/conversation/v1');


app.use(express.static(__dirname + '/public'));

// Set up Conversation service wrapper.
var conversation = new ConversationV1({
  username: '5355f62e-7e8b-4163-8992-9f4f2cc1c7be', // service username
  password: 'AzP3ow1Ped1H', // service password
  version_date: '2017-05-26',
  rejectUnauthorized: false
});

var workspace_id = 'c0c34d11-c4c4-4d19-8001-8e5f8797ce3f'; // workspace ID

var clientInfo = {};


// Find the current members of the current group
function sendCurrentUsers(socket) {
	var info = clientInfo[socket.id];
	var users = [];

	if (typeof info === 'undefined') {
		return;
	}

	// hits when the user wants to enter any particular room
	Object.keys(clientInfo).forEach( function(socketId) {
		var userInfo = clientInfo[socketId];
		if (userInfo.room === info.room)  {
			users.push(userInfo.name);
		}
	});
	socket.emit('message', {
		name : 'System',
		text : 'Current Users : ' + users.join(', '),
		timestamp : moment.valueOf()
	})

}



io.on('connection', function (socket) {
	console.log('User connected via socket.io!');

	// Executes when any user left from a particular room
	socket.on('disconnect', function() {
		var userData = clientInfo[socket.id];
		if (typeof userData !== 'undefined') {
			socket.leave(userData.room);
			io.to(userData.room).emit('message', {
				name : 'System',
				text : userData.name + ' has left. ',
				timestamp : moment.valueOf()
			});
			delete clientInfo[socket.id];
		}
	});

	// Executes when a new user joins into a room
	socket.on('joinRoom', function (req) {
		clientInfo[socket.id] = req;
		socket.join(req.room);
		socket.broadcast.to(req.room).emit('message', {
			name: 'System',
			text: req.name + ' has joined into ' + req.room,
			timestamp: moment().valueOf()
		});
	});
 


 	// Edit with the watson service to give automatic watson response
	socket.on('message', function (message) {
		

		// Executes when a message sends or receives, and write that message to the console.
		console.log('Message received: ' + message.text);  

		if (message.text === '@currentUsers') {
			sendCurrentUsers(socket);
		} else {
			// Write the recieves or sends message to all the users of the same room.
			message.timestamp = moment().valueOf();
			io.to(clientInfo[socket.id].room).emit('message', message);
		}
		conversation.message({
		  workspace_id: workspace_id,
		  input: { text: message.text },
		}, processResponse);
		function processResponse(err, response) {
		  if (err) {
		    console.error(err); // something went wrong
		    return;
		  }
		  /*conversation.message({
		      workspace_id: workspace_id,
		      input: { text: message.text },
		      // Send back the context to maintain state.
		      context : response.context,
		   	}, processResponse)*/
		  
		 // Check for action flags.
		  if (response.intents.length > 0) {
			  if (response.intents[0].intent === 'display_time') {
			    // User asked what time it is, so we output the local system time.
			    io.to(clientInfo[socket.id].room).emit('message', {
					name : 'System ',
					text: 'The current time is ' + new Date().toLocaleTimeString(),
					timestamp : moment().valueOf()
				});
			    console.log('>> System : The current time is ' + new Date().toLocaleTimeString());
			  } 
			  else if (response.intents[0].intent === "display_date") {
			  		io.to(clientInfo[socket.id].room).emit('message', {
					name : 'System ',
					text: 'Todays date  is ' + moment().format("Do MMM YYYY"),
					timestamp : moment().valueOf()
				});
			    console.log('>> System : The current time is ' + new Date().toLocaleTimeString());
			  } else {
			    // Display the output from dialog, if any.
			    if (response.output.text.length != 0) {
			    	if (response.context.check === true) {
			    		console.log('>> System : ' + response.output.text[0]);
				        io.to(clientInfo[socket.id].room).emit('message', {
							name : 'System ',
							text: response.output.text[0],
							res : 'ok',
							timestamp : moment().valueOf()
						});
			    	}
			    	else {
				        console.log('>> System : ' + response.output.text[0]);
				        io.to(clientInfo[socket.id].room).emit('message', {
							name : 'System ',
							text: response.output.text[0],//+ response.output.quickReplies[0],
							timestamp : moment().valueOf()
						});
			    	}
			    }
			}
		  }
		}
	
	});

	// Executes at the start of the application to show an welcome message
	socket.emit('message', {
		name : 'System ',
		text: 'Welcome to the chat application!',
		timestamp : moment().valueOf()
	});
});

http.listen(PORT, function () {
	console.log('Server started!');
});