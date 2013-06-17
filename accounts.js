"use strict";

(function() {

  var crypto = require("crypto");
  var db = require("./database");
  var clients = require("./clients");
  var validate = require("./client/js/validate");
  var bcrypt = require("bcrypt");

  var generateSession = function() {
    return crypto.randomBytes(48).toString("hex");
  };

  module.exports.register = function(connection, data) {
    if(!validate.isValidUsername(data.username) || !validate.isValidEmail(data.email) || !validate.isValidPassword(data.password)) {
      clients.messageClient(connection, "registerFailure", {});
      return;
    }
    var account = {
      username: data.username,
      email: data.email,
      password: bcrypt.hashSync(data.password, 10),
      session: generateSession()
    };
    db.accounts.findOne({ username: account.username }, function(err, existingAccount) {
      if(err) {
        // TODO Something has gone wrong
      } else if(existingAccount) {
        clients.messageClient(connection, "registerFailure", {});
        return;
      } else {
        db.accounts.insert(account, function(err, inserted) {
          if(err || !inserted) {
            // TODO Something has gone wrong
          } else {
            connection.session = account.session;
            clients.addClient(connection);
            var data = {
              username: account.username,
              session: account.session
            };
            clients.messageClient(connection, "loginSuccess", data);
          }
        });
      }
    });
  };

  module.exports.login = function(connection, data) {
    db.accounts.findOne({ username: data.username }, function(err, account) {
      if(err) {
        // TODO Something has gone wrong
      } else if(!account) {
        clients.messageClient(connection, "loginFailure", { message: "Invalid username." });
      } else {
        if(bcrypt.compareSync(data.password, account.password)) {
          if(account.hasOwnProperty("session")) {
            clients.logoutSession(account.session);
          }
          var session = generateSession();
          db.accounts.save({ _id: account._id }, { $set: { session: session } }, function(err, saved) {
            if(err || !saved) {
              // TODO Something has gone wrong
            } else {
              connection.session = session;
              clients.addClient(connection);
              var data = {
                username: account.username,
                session: session
              };
              clients.messageClient(connection, "loginSuccess", data);
            }
          });
        } else {
          clients.messageClient(connection, "loginFailure", { message: "Invalid password." });
        }
        
      }
    });
  };

  module.exports.checkSession = function(connection, data) {
    db.accounts.findOne({ session: data.session }, function(err, account) {
      if(err) {
        // TODO Something has gone wrong
      } else if(!account) {
        clients.messageClient(connection, "sessionInvalid", {});
      } else {
        connection.session = account.session;
        clients.addClient(connection);
        var data = {
          username: account.username,
          session: account.session
        };
        clients.messageClient(connection, "loginSuccess", data);
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
