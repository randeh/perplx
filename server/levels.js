"use strict";

(function() {

  var db = require("./database");
  var clients = require("./clients");
  var ObjectId = require("mongojs").ObjectId;

  module.exports.save = function(connection, data) {
    // validate level
    // is it better to store the data serialised or directly as an object?
    db.levels.insert(data, function(err, inserted) {
      if(err || !inserted) {
        console.log("Error inserting level.");
        return;
      }
      clients.messageClient(connection, "levelSaved", {});
    });
  };

  module.exports.get = function(connection, data) {
    // don't retrieve level data, only name & _id
    db.levels.find(function(err, levels) {
      if(err) {
        console.log("Error occured while retrieving levels.");
        return;
      }
      clients.messageClient(connection, "levelList", levels);
    });
  };

  module.exports.play = function(connection, data) {
    db.levels.findOne({ _id: ObjectId(data) }, function(err, level) {
      if(err) {
        console.log("Error occured while retrieving level data.");
      } else if(!level) {
        console.log("Level no longer exists.");
      } else {
        clients.messageClient(connection, "openLevel", level.level);
      }
    });
  };

}());
