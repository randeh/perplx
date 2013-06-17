"use strict";

(function() {

  var clients = [];

  module.exports.addClient = function(connection) {
    clients.push(connection);
  };

  module.exports.removeClient = function(connection) {
    for(var i=0; i<clients.length; i++) {
      if(clients[i] === connection) {
        clients.splice(i, 1);
        break;
      }
    }
  };

  module.exports.logoutSession = function(session) {
    for(var i=0; i<clients.length; i++) {
      if(clients[i].session === session) {
        delete clients[i].session;
        module.exports.messageClient(clients[i], "sessionInvalid", {});
        break;
      }
    }
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
