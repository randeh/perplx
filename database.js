"use strict";

(function() {

  var databaseUrl = "puzzle-game";
  var collections = ["accounts", "levels"];

  module.exports = require("mongojs").connect(databaseUrl, collections);

}());
