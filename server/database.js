"use strict";

(function() {

  var databaseUrl = "perplx";
  var collections = ["accounts", "levels"];

  var db = require("mongojs").connect(databaseUrl, collections);
  db.accounts.ensureIndex({ email: 1 }, { unique: true });
  db.accounts.ensureIndex({ session: 1 }, { unique: true, sparse: true });

  module.exports = db;

}());
