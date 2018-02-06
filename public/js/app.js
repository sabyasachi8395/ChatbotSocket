var name=getQueryVariable('name') || 'Unknown';
var room=Math.random();
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
	//alert(message.res);

	
	if (message.res === "Play_music") {
		$name.append('<p><strong>' + message.name + ' ' + momentTimestamp.local().format('h:mm a : ') + '</strong>' + message.text + '</p>');
		$name.append('<button class=qreply value="Classical">Classical</button>  ');
		$name.append('<button class=qreply value="Rock">Rock</button>  ');
		$name.append('<button class=qreply value="Pop">Pop</button>');		
	}
	else if (message.res === "choose_music") {
		$name.append('<p><strong>' + message.name + ' ' + momentTimestamp.local().format('h:mm a : ') + '</strong>Ok. Playing.</p>');
		$name.append('<button class=qreply value="Ok">OK</button>');
	}
	else {
		$name.append('<p><strong>' + message.name + ' ' + momentTimestamp.local().format('h:mm a : ') + '</strong>' + message.text + '</p>');
	}
});

// Handles submitting of new message
var $form = $('#message-form');
var $reply = $('.qreply');

$(document).on('click', '.qreply', function () {
	$('.qreply').hide();
	socket.emit('message', {
		name : "You",
		text : $(this).val()
	});
	//alert($('.qreply').val());
});

$form.on('submit', function (event) {
	event.preventDefault();

	var $message = $form.find('input[name=message]');

	socket.emit('message', {
		name: "You",
		text: $message.val()
	});

	$message.val('');
});

