var name=getQueryVariable('name') || 'Unknown';
var room=getQueryVariable('room');
var socket = io();

console.log(name + ' wants to join ' + room);

jQuery('.user-name').append(name);
jQuery('.room-name').append(room);



socket.on('connect', function () {
	console.log('Conncted to socket.io server!');
	socket.emit('joinRoom', {
		name : name,
		room : room
	});
});

socket.on('message', function (message) {
	var momentTimestamp = moment.utc(message.timestamp);
	var $name = jQuery('.messages');
	console.log('New message:');
	console.log(message.text);

	$name.append('<p><strong>' + message.name + ' ' + momentTimestamp.local().format('h:mma : ') + '</strong>' + message.text + '</p>');
});

// Handles submitting of new message
var $form = jQuery('#message-form');

$form.on('submit', function (event) {
	event.preventDefault();

	var $message = $form.find('input[name=message]');

	socket.emit('message', {
		name: name,
		text: $message.val()
	});

	$message.val('');
});