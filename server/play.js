"use strict";

(function() {

  var clients = require("./clients");
  var levels = require("./levels");

  module.exports.exit = function(connection, data) {
    connection.area = "lobby";
    clients.messageClient(connection, "openLobby", {});
    levels.getAll(connection);
  }

}());
