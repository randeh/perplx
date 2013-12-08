"use strict";

(function() {

  var mongojs = require("mongojs");

  var databaseUrl = "perplx";
  var collections = ["accounts", "levels"];

  var db = mongojs.connect(databaseUrl, collections);
  db.accounts.ensureIndex({ email: 1 }, { unique: true });
  db.accounts.ensureIndex({ session: 1 }, { unique: true, sparse: true });

  module.exports = db;

}());
