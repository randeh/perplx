"use strict";

(function() {

  var db = require("./database");
  var clients = require("./clients");
  var ObjectId = require("mongojs").ObjectId;

  module.exports.save = function(connection, data) {
    // TODO Validate level
    db.levels.findOne({ name: data.name }, function(err, level) {
      if(err) {
        console.log("Error checking for level");
        return;
      } else if(level) {
        if(!level.creator.equals(connection._id)) {
          clients.messageClient(connection, "levelNotSaved", { message: "A level with this name already exists." });
          return;
        }
        data._id = level._id;
      }
      data.creator = connection._id;
      data.ratings = [];
      data.completions = [];
      data.level = JSON.stringify(data.level);
      db.levels.save(data, function(err, saved) {
        if(err || !saved) {
          console.log("Error saving level.");
          return;
        }
        clients.messageClient(connection, "levelSaved", {});
      });
    });
  };

  var get = function(connection, filter) {
    db.levels.find(filter, { level: 0 }, function(err, levels) {
      if(err) {
        console.log("Error occured while retrieving levels.");
        return;
      }
      for(var i = 0; i < levels.length; i++) {
        var level = levels[i];
        // TODO set .rating, .rated & .completed based on .ratings & .completions
        // TEMP:
        level.completed = Math.random() < 0.5; // TEMP
        level.rated = level.completed && Math.random() < 0.5; // TEMP
        level.rating = (Math.random() * 4) + 1; // TEMP
        if(level.rated) {
          level.rating = Math.round(level.rating);
        }

        delete level.ratings;
        delete level.completions;
        if(level.creator.equals(connection._id)) {
          level.own = true;
        }
      }
      clients.messageClient(connection, "levelList", levels);
    });
  };

  module.exports.getAll = function(connection) {
    get(connection, {});
  };

  module.exports.getOwn = function(connection) {
    get(connection, { creator: connection._id });
  };

  module.exports.create = function(connection) {
    connection.area = "editor";
    clients.messageClient(connection, "openEditor", {});
  };

  module.exports.discard = function(connection) {
    connection.area = "lobby";
    clients.messageClient(connection, "openLobby", {});
    module.exports.getAll(connection);
  };

  module.exports.play = function(connection, data) {
    db.levels.findOne({ _id: ObjectId(data._id) }, { level: 1 }, function(err, level) {
      if(err) {
        console.log("Error occured while retrieving level data.");
      } else if(!level) {
        console.log("Level no longer exists.");
      } else if(level.players > 1) {
        console.log("Attempting to play a multiplayer level alone.");
      } else {
        connection.area = "play";
        clients.messageClient(connection, "openLevel", level.level);
      }
    });
  };

  module.exports.rate = function(connection, data) {
    // TODO
    // check data.rating is a valid rating, i.e. {1, 2, 3, 4, 5}
    // find the level
    // make sure we've completed the level
    // search through the ratings
    //  if we've already rated it, update that
    //  otherwise, add a new rating
    //  clients.messageAllInArea("lobby", "updateRating", { level._id, level.rating });
  };

  module.exports.edit = function(connection, data) {
    db.levels.findOne({ _id: ObjectId(data._id) }, { creator: 1, level: 1 }, function(err, level) {
      if(err) {
        console.log("Error occured while retrieving level data.");
        return;
      }
      connection.area = "editor";
      clients.messageClient(connection, "editLevel", level.level);
    });
  };

  module.exports.remove = function(connection, data) {
    // TODO deal with people who are waiting to play (or even playing) the level
    db.levels.remove({ _id: ObjectId(data._id), creator: connection._id }, function(err, removed) {
      if(err) {
        console.log("Error deleting level.");
        return;
      }
      clients.messageAllInArea("lobby", "removeLevel", { _id: data._id });
    });
  };

}());
