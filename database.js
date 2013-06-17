"use strict";

(function() {

  var databaseUrl = "puzzle-game";
  var collections = ["accounts", "levels"];

  var db = require("mongojs").connect(databaseUrl, collections);
  db.accounts.ensureIndex({ username: 1, email: 1 }, { unique: true });

  module.exports = db;

}());
