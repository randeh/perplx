"use strict";

var callbacks = {};
var messageServer;

$(document).ready(function(event) {

  var socket = new WebSocket("ws://localhost:8080");

  socket.addEventListener("open", function(event) {
    if(typeof localStorage.session === "undefined") {
      openLogin();
    } else {
      var data = {
        "session": localStorage.session
      };
      delete localStorage.session;
      messageServer("checkSession", data);
    }
  });

  socket.addEventListener("message", function(event) {
    var response = JSON.parse(event.data);
    callbacks[response["action"]](response["data"]);
  });

  socket.addEventListener("error", function(event) {
    callbacks.displayError({ message: "WebSocket error: " + event });
  });

  socket.addEventListener("close", function(event) {
    callbacks.displayError({ message: "WebSocket closed" });
  });

  messageServer = function(action, data) {
    var message = {
      "action": action,
      "data": data
    };
    if(typeof localStorage.session !== "undefined") {
      message["session"] = localStorage.session;
    }
    socket.send(JSON.stringify(message));
  };

  callbacks.sessionInvalid = function(data) {
    delete localStorage.session;
    openLogin();
  }

  callbacks.displayError = function(data) {
    throw(data["message"]);
    openLoading();
  };

});
