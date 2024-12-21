'use strict'

var contacts = document.getElementsByClassName("contacts");
var mainChat = document.getElementById('mainChat');
var chatMenu = document.getElementById('chatMenu');
var textArea = document.getElementById('textArea');
var form = document.getElementById('form');
var selectedContact = "";
var socket = io();
var chatRoom = undefined;

var myFunction = async function () {
    chatRoom = this.getAttribute('data-chatroom');
    selectedContact = this.textContent.trim();
    textArea.placeholder = `Chat with ${selectedContact}`;

    // get all previous messages
    document.getElementById('messages').innerHTML = ''
    const url = window.location.href
    const texts = await axios.get(url + 'chatRoom/' + chatRoom)

    texts.data.forEach(element => {
        var li = document.createElement('li');
        li.textContent = `${element.message}`;
        if (element.to == selectedContact)
            li.className = 'border bg-light ps-3 rounded w-25 ms-0 my-2 '; // Add some styling for received messages
        else
            li.className = 'border bg-light ps-3 rounded w-25 ms-auto me-2 my-2 '
        messages.appendChild(li);
    });

    for (var j = 0; j < contacts.length; j++) {
        contacts[j].classList.remove('bg-light');
    }

    if (!this.classList.contains('bg-info')) {
        this.className += ' bg-light';
    }
    chatMenu.style.display = 'flex';

    // Notify server to join the room
    socket.emit('chatStart', { chatRoom: chatRoom });
};

for (var i = 0; i < contacts.length; i++) {
    contacts[i].addEventListener('click', myFunction, false);
}

form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (textArea.value) {
        socket.emit('chat message', {
            chatRoom: chatRoom,
            message: textArea.value
        });

        var li = document.createElement('li');
        li.textContent = `${textArea.value}`;
        li.className = 'border bg-light ps-3 rounded w-25 ms-auto me-2 my-2 '; // Add some styling for sent messages
        messages.appendChild(li);

        // Clear the input field
        textArea.value = '';
    }
});

// Listen for incoming messages
socket.on('chat message', function (data) {
    if (data.chatRoom === chatRoom) {
        var li = document.createElement('li');
        li.textContent = `${data.message}`;
        li.className = 'border bg-light ps-3 rounded w-25 ms-0 my-2 '; // Add some styling for received messages
        messages.appendChild(li);
    }
});
