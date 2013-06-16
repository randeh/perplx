"use strict";

(function() {

  var crypto = require("crypto");
  var accounts = [];
  var clients = [];
  var databaseUrl = "puzzle-game"; // "username:password@example.com/mydb"
  var collections = ["users"]
  var db = require("mongojs").connect(databaseUrl, collections);

  module.exports.removeClient = function(connection) {
    for(var i=0; i<clients.length; i++) {
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
    account.bum = "poo";
    connection.session = session;
    clients.push(connection);
    var data = {
      username: account.username,
      session: session
    };
    module.exports.messageClient(connection, "loginSuccess", data)
  };

  module.exports.register = function(connection, data) {
    // TODO Validate using require("client/js/validate")
    var account = {
      username: data.username,
      email: data.email,
      password: data.password // TODO hash this
    };
    accounts.push(account);
    db.users.save(account, function(err, saved) {
      if( err || !saved ) console.log("User not saved");
      else console.log("User saved");
    });
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
    module.exports.messageClient(connection, "sessionInvalid", {});
  };

  module.exports.logout = function(connection, data) {
    module.exports.removeClient(connection);
    for(var i=0; i<accounts.length; i++) {
      if(accounts[i].session === connection.session) {
        delete accounts[i].session;
        break;
      }
    }
    delete connection.session;
    module.exports.messageClient(connection, "logoutSuccess", {});
  };

}());
