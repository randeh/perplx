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
        // TODO
        // TEMP
        // set this level as completed (for testing purposes)
      }
    });
  };

  module.exports.rate = function(connection, data) {
    // TODO
    // check data.rating is a valid rating, i.e. {1, 2, 3, 4, 5}
    // find the level & completion in one step
    // search through ratings (keep track of total and count)
    //   if we've already rated it
    //     update that: http://stackoverflow.com/questions/13777097/update-an-subdocument-contained-in-an-array-contained-in-a-mongodb-document
    //   otherwise
    //     add a new rating: http://docs.mongodb.org/manual/reference/operator/update/push/
    //     count++
    // total += rating
    // clients.messageAllInArea("lobby", "updateRating", { level._id, total / count });
    if(data.rating >= 1 && data.rating <= 5 && data.rating == Math.round(data.rating)) {
      db.levels.findOne({ _id: ObjectId(data._id) }, { completions: 1, ratings: 1 }, function(err, level) {
        if(err) {
          console.log("Error occured while rating.");
        } else if(!level) {
          console.log("Attempting to rate level which does not exist.");
        } else {
          db.levels.findOne({ _id: ObjectId(data._id), "completions._id": connection._id }, function(err, completion) {
            if(err) {
              console.log("Error occured while rating.");
            } else if(!completion) {
              console.log("Attempting to rate level before completion.");
            } else {
              level.ratings.save({ _id: connection._id, rating: data.rating });
              clients.messageAllInArea("lobby", "updateRating", { level: data._id, rating: data.rating });
            }
          });
        }
      });
    } else {
      console.log("Invalid rating.");
    }
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
