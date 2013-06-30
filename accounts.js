"use strict";

(function() {

  var crypto = require("crypto");
  var db = require("./database");
  var clients = require("./clients");
  var validate = require("./client/scripts/validate");
  var bcrypt = require("bcrypt");

  var generateSession = function() {
    return crypto.randomBytes(48).toString("hex");
  };

  module.exports.register = function(connection, data) {
    if(!validate.isValidName(data.name) || !validate.isValidEmail(data.email) || !validate.isValidPassword(data.password)) {
      clients.messageClient(connection, "registerFailure", {});
      return;
    }
    bcrypt.hash(data.password, 10, function(err, hash) {
      if(err || !hash) {
        // TODO Something has gone wrong
      } else {
        var account = {
          name: data.name,
          email: data.email,
          password: hash,
          session: generateSession()
        };
        db.accounts.findOne({ $or: [ { name: account.name }, { email: account.email } ] }, function(err, existingAccount) {
          if(err) {
            // TODO Something has gone wrong
          } else if(existingAccount) {
            clients.messageClient(connection, "registerFailure", {});
          } else {
            db.accounts.insert(account, function(err, inserted) {
              if(err || !inserted) {
                // TODO Something has gone wrong
              } else {
                connection.session = account.session;
                clients.addClient(connection);
                var data = {
                  session: account.session
                };
                clients.messageClient(connection, "loginSuccess", data);
              }
            });
          }
        });
      }
    });
  };

  module.exports.login = function(connection, data) {
    db.accounts.findOne({ email: data.email }, function(err, account) {
      if(err) {
        // TODO Something has gone wrong
      } else if(!account) {
        clients.messageClient(connection, "loginFailure", { message: "Invalid email address." });
      } else {
        bcrypt.compare(data.password, account.password, function(err, match) {
          if(err) {
            // TODO Something has gone wrong
          } else if(match) {
            if(account.hasOwnProperty("session")) {
              clients.logoutSession(account.session);
            }
            var session = generateSession();
            db.accounts.update({ _id: account._id }, { $set: { session: session } }, function(err, updated) {
              if(err || !updated) {
                // TODO Something has gone wrong
              } else {
                connection.session = session;
                clients.addClient(connection);
                var data = {
                  session: session
                };
                clients.messageClient(connection, "loginSuccess", data);
              }
            });
          } else {
            clients.messageClient(connection, "loginFailure", { message: "Invalid password." });
          }
        });
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
