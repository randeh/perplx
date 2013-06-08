"use strict";

var messageServer;
var callbacks;

$(document).ready(function(event) {

  var socket = new WebSocket("ws://localhost:8080");

  socket.addEventListener("open", function(event) {
    // Display login screen once the socket is open
    // TODO if we're already logged in, go to the home screen?
    $("#loading-pane").hide();
    $("#login-pane").show();
  });

  socket.addEventListener("message", function(event) {
    $("#loading-pane").hide();
    var response = JSON.parse(event.data);
    if(!response.hasOwnProperty("callback") || typeof window[response.callback] !== 'function') {
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

  displayError = function(message) {
    $(".pane").hide();
    $("#loading-pane").show();
    alert(message);
  };

  messageServer = function(message) {
    // Add session id?
    socket.send(message);
  };

});
