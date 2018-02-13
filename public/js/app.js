var name=getQueryVariable('name') || 'Unknown';
var room=Math.random();
var socket = io();


console.log(name + ' wants to join ' + room);
jQuery('.user-name').append(name);



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
	alert(message.context);
	if (message.context == 'Job_enquiry') {
		$name.append('<p><strong>' + message.name + ' ' + momentTimestamp.local().format('h:mm a : ') + '</strong>' + message.text);
		$name.append('<button class=qreply value="Accountant">Accountant</button>  ');
		$name.append('<button class=qreply value="Office Staff">Office Staff</button>  ');		
		$name.append('<button class=qreply value="Sales Representative">Sales Representative</button>  ');
	}
	else if (message.res == 'Play_music') {
		$name.append('<p><strong>' + message.name + ' ' + momentTimestamp.local().format('h:mm a : ') + '</strong>' + message.text + '</p>');
		$name.append('<button class=qreply value="Classical">Classical</button>  ');
		$name.append('<button class=qreply value="Rock">Rock</button>  ');
		$name.append('<button class=qreply value="Pop">Pop</button>');		
	}
	else if (message.res == 'weather_details') {
		$name.append('<p><strong>' + message.name + ' ' + momentTimestamp.local().format('h:mm a : ') + '</strong>' + message.text + '(Type the city name if not listed)</p>');
		$name.append('<button class=qreply value="Mumbai">Mumbai</button>  ');
		$name.append('<button class=qreply value="Delhi">Delhi</button>  ');		
		$name.append('<button class=qreply value="Kolkata">Kolkata</button>  ');		
	}
	else if (message.res == 'choose_music') {
		//$name.append('<p><strong>' + message.name + ' ' + momentTimestamp.local().format('h:mm a : ') + '</strong>Ok. Playing.</p>');
		
		$name.append('<p><strong>' + message.name + ' ' + momentTimestamp.local().format('h:mm a : ') + '</strong>' + message.text + '</p>');
		$name.append('<button class=qreply value="Thanks">Thanks</button>');
	}
	else if (message.res == 'name') {
		$name.append('<p><strong>' + message.name + ' ' + momentTimestamp.local().format('h:mm a : ') + '</strong>' + message.text + '</p>');
		$name.append('<p><strong>' + message.name + ' ' + momentTimestamp.local().format('h:mm a : ') + '</strong>Enter your name :  </p>');
	} else if (message.context == 'Job_apply') {
		$name.append('<p><strong>' + message.name + ' ' + momentTimestamp.local().format('h:mm a : ') + '</strong>' + message.text + '</p>');
	}
	else if (message.context == 'Job_taking_name') {
		$name.append('<p><strong>' + message.name + ' ' + momentTimestamp.local().format('h:mm a : ') + '</strong>' + message.text + '</p>');	
	}
	else if (message.context == 'Job_taking_contact') {
		$name.append('<p><strong>' + message.name + ' ' + momentTimestamp.local().format('h:mm a : ') + '</strong>' + message.text + '</p>');	

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
	//alert($(this).val());
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