"use strict";

(function() {

  var clients = [];

  module.exports.addClient = function(connection) {
    console.log("Adding client " + clients.length);
    clients.push(connection);
    console.log("Added client " + clients.length);
  }

  module.exports.removeClient = function(connection) {
    console.log("Removing client " + clients.length);
    for(var i=0; i<clients.length; i++) {
      if(clients[i] === connection) {
        clients.splice(i, 1);
        break;
      }
    }
    console.log("Removed client " + clients.length);
  };

  module.exports.messageClient = function(connection, action, data) {
    var message = {
      action: action,
      data: data
    };
    var messageString = JSON.stringify(message);
    connection.sendUTF(messageString);
  };

  module.exports.messageAll = function(action, data) {
    var message = {
      action: action,
      data: data
    };
    var messageString = JSON.stringify(message);
    for(var i=0; i<clients.length; i++) {
      clients[i].sendUTF(messageString);
    }
  };

  module.exports.messageAllExcept = function(connection, action, data) {
    var message = {
      action: action,
      data: data
    };
    var messageString = JSON.stringify(message);
    for(var i=0; i<clients.length; i++) {
      if(clients[i] !== connection) {
        clients[i].sendUTF(messageString);
      }
    }
  };

}());
