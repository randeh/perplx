"use strict";

var callbacks = {};
var messageServer;

$(document).ready(function(event) {

  var socket = new WebSocket("ws://localhost:8080");

  socket.addEventListener("open", function(event) {
    if(localStorage.session === undefined) {
      // No existing session, go to login screen
      $("#loading-pane").hide();
      $("#login-pane").show();
    } else {
      // Check if stored session is still valid
      var data = {
        session: localStorage.session
      };
      delete localStorage.session;
      messageServer("checkSession", data);
    }
  });

  socket.addEventListener("message", function(event) {
    $("#loading-pane").hide();
    var response = JSON.parse(event.data);
    if(!response.hasOwnProperty("action")) {
      displayError("Unexpected response");
    } else {
      callbacks[response.action](response.data);
    }
  });

  socket.addEventListener("error", function(event) {
    displayError("WebSocket error: " + event);
  });

  socket.addEventListener("close", function(event) {
    displayError("WebSocket closed");
  });

  messageServer = function(action, data) {
    var message = {
      action: action,
      data: data
    };
    if(localStorage.session !== undefined) {
      message.session = localStorage.session;
    }
    var messageString = JSON.stringify(message);
    socket.send(messageString);
  };

});

callbacks.sessionInvalid = function(data) {
  // Stored session is invalid, go to login screen
  $("#loading-pane").hide();
  $("#login-pane").show();
}

var displayError = function(message) {
  $(".pane").hide();
  $("#loading-pane").show();
  alert(message);
};
