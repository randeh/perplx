"use strict";

window.addEventListener("load", function(event) {
  var loginPane = document.getElementById("login-pane");
  var loginUsername = document.getElementById("login-username");
  var loginPassword = document.getElementById("login-password");
  var loginButton = document.getElementById("login-button");
  var loginRegister = document.getElementById("login-register");

  var registerPane = document.getElementById("register-pane");
  var registerUsername = document.getElementById("register-username");
  var registerEmail = document.getElementById("register-email");
  var registerPassword = document.getElementById("register-password");
  var registerPassword2 = document.getElementById("register-password2");
  var registerButton = document.getElementById("register-button");

  var homePane = document.getElementById("home-pane");
  var homeUsername = document.getElementById("home-username");

  var socket = new WebSocket("ws://localhost:8080");

  loginButton.addEventListener("click", function(event) {
    var username = loginUsername.value;
    var password = loginPassword.value;
    loginUsername.value = "";
    loginPassword.value = "";
    // send login attempt to server
    socket.send(username + " " + password);
  });

  loginRegister.addEventListener("click", function(event) {
    loginPane.style.visibility = "none";
    registerPane.style.visibility = "visible";
    return false;
  });

  registerButton.addEventListener("click", function(event) {
    var username = registerUsername.value;
    var email = registerEmail.value;
    var password = registerPassword.value;
    var password2 = registerPassword2.value;
    // perform validation
    // clear fields
    // send register attempt to server
  });

  socket.addEventListener("message", function(event) {
    alert(event.data);
  })

});

/*
// Initialize everything when the window finishes loading
window.addEventListener("load", function(event) {
  var status = document.getElementById("status");
  var url = document.getElementById("url");
  var open = document.getElementById("open");
  var close = document.getElementById("close");
  var send = document.getElementById("send");
  var text = document.getElementById("text");
  var message = document.getElementById("message");
  var socket;

  status.textContent = "Not Connected";
  url.value = "ws://localhost:8080";
  close.disabled = true;
  send.disabled = true;

  // Create a new connection when the Connect button is clicked
  open.addEventListener("click", function(event) {
    open.disabled = true;
    socket = new WebSocket(url.value, "echo-protocol");

    socket.addEventListener("open", function(event) {
      close.disabled = false;
      send.disabled = false;
      status.textContent = "Connected";
    });

    // Display messages received from the server
    socket.addEventListener("message", function(event) {
      message.textContent = message.textContent + " " + event.data;
    });

    // Display any errors that occur
    socket.addEventListener("error", function(event) {
      message.textContent = "Error: " + event;
    });

    socket.addEventListener("close", function(event) {
      open.disabled = false;
      status.textContent = "Not Connected";
    });
  });

  // Close the connection when the Disconnect button is clicked
  close.addEventListener("click", function(event) {
    close.disabled = true;
    send.disabled = true;
    socket.close();
  });

  // Send text to the server when the Send button is clicked
  send.addEventListener("click", function(event) {
    socket.send(text.value);
    text.value = "";
  });
});
*/
