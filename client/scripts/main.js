"use strict";

var sessionId;
var callbacks = {};

$(document).ready(function(event) {

  var socket = new WebSocket("ws://localhost:8080");

  socket.addEventListener("open", function(event) {
    // TODO if we're already logged in, go to the home screen?
    //      check session cookie and send to server to be checked
    //      is this unsecure? providing a method to check if session ids are valid?
    // Display login screen once the socket is open
    $("#loading-pane").hide();
    $("#login-pane").show();
  });

  socket.addEventListener("message", function(event) {
    $("#loading-pane").hide();
    var response = JSON.parse(event.data);
    if(!response.hasOwnProperty("callback")) {
      displayError("Unexpected response");
    } else {
      callbacks[response.callback](response.data);
    }
  });

  socket.addEventListener("error", function(event) {
    displayError("WebSocket error: " + event);
  });

  socket.addEventListener("close", function(event) {
    displayError("WebSocket closed");
  });

});

var displayError = function(message) {
  $(".pane").hide();
  $("#loading-pane").show();
  alert(message);
};

var messageServer = function(message) {
  if(sessionId !== undefined) {
    message.session = sessionId;
  }
  var data = JSON.stringify(message);
  socket.send(data);
};
