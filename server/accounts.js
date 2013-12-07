"use strict";

(function() {

  var crypto = require("crypto");
  var db = require("./database");
  var clients = require("./clients");
  var validate = require("./../client/scripts/validate");
  var bcrypt = require("bcrypt");

  var generateSession = function() {
    return crypto.randomBytes(48).toString("hex");
  };

  module.exports.register = function(connection, data) {
    if(!validate.isValidName(data.name) || !validate.isValidEmail(data.email) || !validate.isValidPassword(data.password)) {
      clients.messageClient(connection, "registerFailure", data);
      return;
    }
    bcrypt.hash(data.password, 10, function(err, hash) {
      if(err || !hash) {
        console.log("Failed to hash password.");
        return;
      }
      var account = {
        name: data.name,
        email: data.email,
        password: hash,
        session: generateSession()
      };
      db.accounts.findOne({ $or: [ { name: account.name }, { email: account.email } ] }, function(err, existingAccount) {
        if(err) {
          console.log("Error occured while checking for existing account.");
        } else if(existingAccount) {
          data.message = "Email address already in use.";
          clients.messageClient(connection, "registerFailure", data);
        } else {
          db.accounts.insert(account, function(err, inserted) {
            if(err || !inserted) {
              console.log("Error occured while creating new account.");
              return;
            }
            connection.session = account.session;
            clients.addClient(connection);
            clients.messageClient(connection, "loginSuccess", { session: account.session });
          });
        }
      });
    });
  };

  module.exports.login = function(connection, data) {
    db.accounts.findOne({ email: data.email }, function(err, account) {
      if(err) {
        console.log("Error occured while logging in.");
      } else if(!account) {
        data.message = "Invalid email address.";
        clients.messageClient(connection, "loginFailure", data);
      } else {
        bcrypt.compare(data.password, account.password, function(err, match) {
          if(err) {
            console.log("Error occured while checking password.");
          } else if(match) {
            if(account.hasOwnProperty("session")) {
              clients.logoutSession(account.session);
            }
            var session = generateSession();
            db.accounts.update({ _id: account._id }, { $set: { session: session } }, function(err, updated) {
              if(err || !updated) {
                console.log("Error occured while logging in.");
                return;
              }
              connection.session = session;
              clients.addClient(connection);
              clients.messageClient(connection, "loginSuccess", { session: session });
            });
          } else {
            data.message = "Invalid password.";
            clients.messageClient(connection, "loginFailure", data);
          }
        });
      }
    });
  };

  module.exports.checkSession = function(connection, data) {
    db.accounts.findOne({ session: data.session }, function(err, account) {
      if(err) {
        console.log("Error occured while checking session.");
      } else if(!account) {
        clients.messageClient(connection, "sessionInvalid", {});
      } else {
        connection.session = account.session;
        clients.addClient(connection);
        clients.messageClient(connection, "loginSuccess", { session: account.session });
      }
    });
  };

  module.exports.logout = function(connection, data) {
    clients.removeClient(connection);
    db.accounts.update({ session: connection.session }, { $unset: { session: 1 } });
    delete connection.session;
    clients.messageClient(connection, "logoutSuccess", {});
  };

  module.exports.checkAvailability = function(connection, data) {
    db.accounts.findOne({ name: data.name }, function(err, account) {
      if(err) {
        console.log("Error occured while checking name availability.");
      } else if(!account) {
        clients.messageClient(connection, "nameAvailable", data);
      } else {
        clients.messageClient(connection, "nameUnavailable", data);
      }
    });
  };

}());
