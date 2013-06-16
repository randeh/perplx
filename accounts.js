"use strict";

(function() {

  var crypto = require("crypto");
  var db = require("./database");
  var clients = require("./clients");

  var login = function(connection, account) {
    var session = crypto.randomBytes(48).toString("hex");
    account.session = session; // TODO need to alter database for this
    connection.session = session;
    clients.addClient(connection);
    var data = {
      username: account.username,
      session: session
    };
    clients.messageClient(connection, "loginSuccess", data)
  };

  module.exports.register = function(connection, data) {
    // TODO Validate using require("client/js/validate")
    var account = {
      username: data.username,
      email: data.email,
      password: data.password // TODO hash this
    };
    // TODO Make sure an account doesn;t already exist with this username/email
    db.accounts.save(account, function(err, saved) {
      if(err || !saved) {
        console.log("Account not saved");
        // TODO Send register failure message
      } else {
        console.log("Account saved");
        login(connection, account);
      }
    });
  };

  module.exports.login = function(connection, data) {
    var query = {
      username: data.username,
      password: data.password
    };
    db.accounts.findOne(query, function(err, account) {
      if(err) {
        //
      } else if(!account) {
        // TODO invalid username and/or password
      } else {
        login(connection, account);
      }
    });
  };

  module.exports.checkSession = function(connection, data) {
    db.accounts.findOne({ session: data.session }, function(err, account) {
      if(err) {
        // 
      } else if(!account) {
        clients.messageClient(connection, "sessionInvalid", {});
      } else {
        login(connection, account);
      }
    });
  };

  module.exports.logout = function(connection, data) {
    clients.removeClient(connection);
    db.accounts.update({ session: connection.session }, { $unset: { session: 1 } });
    delete connection.session;
    clients.messageClient(connection, "logoutSuccess", {});
  };

}());
