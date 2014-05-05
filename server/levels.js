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
        // Completed
        level.completed = false;
        for(var j = 0; j < level.completions.length; j++) {
          if(level.completions[j]._id.equals(connection._id)) {
            level.completed = true;
            break;
          }
        }
        delete level.completions;
        // Rated
        level.rated = false;
        var sum = 0;
        var count = level.ratings.length;
        for(var j = 0; j < count; j++) {
          sum += level.ratings[j].rating;
          if(level.ratings[j]._id.equals(connection._id)) {
            level.rated = true;
            level.rating = level.ratings[j].rating;
            break;
          }
        }
        delete level.ratings;
        // Rating
        if(!level.rated) {
          if(count == 0) {
            level.rating = 0;
          } else {
            level.rating = sum / count;
          }
        }
        // Own
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
        // TODO need to do anything else here?

        // TEMP set this level as completed now (for testing purposes)
        db.levels.update({ _id: ObjectId(data._id) }, { $push: { completions: { _id: connection._id, time: Math.random() * 500 } } }, function(err, updated) {
          if(err || !updated) {
            console.log("Error occured while adding completion.");
          }
        });
      }
    });
  };

  module.exports.rate = function(connection, data) {
    // TODO could possibly merge this mess of nested queries into one
    if(data.rating >= 1 && data.rating <= 5 && data.rating == Math.round(data.rating)) {
      db.levels.findOne({ _id: ObjectId(data._id) }, { completions: 1, ratings: 1 }, function(err, level) {
        if(err) {
          console.log("Error occured while rating.");
        } else if(!level) {
          console.log("Attempting to rate level which does not exist.");
        } else {
          db.levels.findOne({ _id: ObjectId(data._id), "completions._id": connection._id }, function(err, level) {
            if(err) {
              console.log("Error occured while rating.");
            } else if(!level) {
              console.log("Attempting to rate level before completing.");
            } else {
              for(var i = 0; i < level.ratings.length; i++) {
                if(level.ratings[i]._id.equals(connection._id)) {
                  db.levels.update({ _id: ObjectId(data._id), "ratings._id": connection._id }, { $set: { "ratings.$.rating": data.rating } }, function(err, updated) {
                    if(err || !updated) {
                      console.log("Error occured while rating.");
                    }
                  });
                  // TODO notify lobby about updated rating
                  return;
                }
              }
              db.levels.update({ _id: ObjectId(data._id) }, { $push: { ratings: { _id: connection._id, rating: data.rating } } }, function(err, updated) {
                if(err) {
                  console.log("Error occured while rating.");
                } else if(!updated) {
                  console.log("Rating not updated.");
                } else {
                  // TODO message all players with the new OVERALL rating rather than just this rating (new or existing rating)
                  //clients.messageAllInArea("lobby", "updateRating", { level: data._id, rating: RATING });
                }
              });
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
