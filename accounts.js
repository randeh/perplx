"use strict";

(function() {

  var crypto = require("crypto");

  var accounts = [];
  var clients = [];

  module.exports.removeClient = function(connection) {
    for(var i=0; i<clients.length; i++)
    {
      if(clients[i] === connection) {
        clients.splice(i, 1);
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

  var generateSession = function() {
    return crypto.randomBytes(48).toString("hex");
  };

  var login = function(connection, account) {
    var session = generateSession();
    account.session = session;
    connection.session = session;
    clients.push(connection);
    var data: {
      username: account.username,
      session: session
    };
    messageClient(connection, "loginSuccess", data)
  };

  module.exports.register = function(connection, data) {
    // TODO Validate using require("client/js/validate")
    var account = {
      username: data.username,
      email: data.email,
      password: data.password // TODO hash this
    };
    accounts.push(account);
    login(connection, account);
  };

  module.exports.login = function(connection, data) {
    for(var i=0; i<accounts.length; i++) {
      if(accounts[i].username === data.username) {
        if(accounts[i].password === data.password) {
          login(connection, accounts[i]);
        } else {
          // TODO invalid password
        }
        return;
      }
    }
    // TODO invalid username
  };

  module.exports.checkSession = function(connection, data) {
    for(var i=0; i<accounts.length; i++) {
      if(accounts[i].session === data.session) {
        login(connection, accounts[i]);
        return;
      }
    }
    messageClient(connection, "sessionInvalid", {});
  };

}());
