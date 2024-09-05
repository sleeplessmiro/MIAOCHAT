const socket = io();

// Prompt for username when connecting
const username = prompt('Enter your name:');
socket.emit('new user', username); // Send username to server

// DOM elements
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

// Event listener for form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
  }
});

// Listen for incoming messages
socket.on('chat message', (data) => {
  displayMessage(data);
});

// Listen for message history
socket.on('message history', (history) => {
  history.forEach(message => {
    displayMessage(message);
  });
});

// Notify when a user connects
socket.on('user connected', (username) => {
  const item = document.createElement('li');
  item.textContent = `${username} connected`;
  messages.appendChild(item);
});

// Notify when a user disconnects
socket.on('user disconnected', (username) => {
  const item = document.createElement('li');
  item.textContent = `${username} disconnected`;
  messages.appendChild(item);
});

// Function to display a message in the chat
function displayMessage(data) {
  const { username, message } = data;
  const item = document.createElement('li');
  item.textContent = `${username}: ${message}`;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight; // Scroll to bottom of message list
}
