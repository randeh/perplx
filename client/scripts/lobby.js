"use strict";

$(document).ready(function(event) {

  var levels;

  callbacks.openLobby = function(data) {
    if(closeCurrentWindow !== null) {
      closeCurrentWindow();
    }
    $("#main-container").show();
    $("#lobby-pane").show();
    $("#lobby-all-levels").click(preventDefault).addClass("selected");
    $("#lobby-my-levels").click(showMyLevels);
    levels = {};
    closeCurrentWindow = closeLobby;
  };

  var closeLobby = function() {
    $("#main-container").hide();
    $("#lobby-pane").hide();
    $("#lobby-levels").empty();
    levels = null;
    $(".lobby-level-filter").off("click").removeClass("selected");
    closeCurrentWindow = null;
  };

  $("#logout-button").click(function(event) {
    messageServer("logout", {});
    openMainLoading();
  });

  callbacks.logoutSuccess = function(data) {
    delete localStorage.session;
    openLogin();
  };

  $("#lobby-editor").click(function(event) {
    messageServer("newLevel", {});
    openMainLoading();
    event.preventDefault();
  });

  var preventDefault = function(event) {
    event.preventDefault();
  };

  var showAllLevels = function(event) {
    $("#lobby-all-levels").off("click").click(preventDefault).addClass("selected");
    $("#lobby-my-levels").click(showMyLevels).removeClass("selected");
    $("#lobby-levels").empty();
    levels = {};
    messageServer("getAllLevels", {});
    if(event) {
      event.preventDefault();
    }
  };

  var showMyLevels = function(event) {
    $("#lobby-my-levels").off("click").click(preventDefault).addClass("selected");
    $("#lobby-all-levels").click(showAllLevels).removeClass("selected");
    $("#lobby-levels").empty();
    levels = {};
    messageServer("getOwnLevels", {});
    if(event) {
      event.preventDefault();
    }
  };

  var buildRating = function(id, completed, rating, rated) {
    var container = $(document.createElement("td"));
    var halfStars = Math.round(rating * 2);
    var starImgs = new Array(5);
    for(var s = 0; s < 5; s++) {
      var starType;
      if(halfStars >= 2) {
        starType = "images/full-star";
        halfStars -= 2;
      } else if(halfStars >= 1) {
        starType = "images/half-star";
        halfStars--;
      } else {
        starType = "images/empty-star";
      }
      // Own ratings should stand out, others' ratings grey
      if(!rated) {
        starType += "-grey";
      }
      starType += ".png";
      starImgs[s] = $(document.createElement("img")).prop("src", starType);
      starImgs[s].data("starType", starType);
      container.append(starImgs[s]);
      // Only allow rating of completed levels
      if(completed) {
        starImgs[s].hover(function(event) {
          // On mouse over, show potential rating
          var starNum = $(this).data("starNum");
          var starImgs = $(this).data("starImgs");
          for(var x = 0; x < 5; x++) {
            if(x <= starNum) {
              starImgs[x].prop("src", "images/full-star.png");
            } else {
              starImgs[x].prop("src", "images/empty-star.png");
            }
          }
        }, function(event) {
          // On mouse out, restore previous rating
          var starImgs = $(this).data("starImgs");
          for(var x = 0; x < 5; x++) {
            starImgs[x].prop("src", starImgs[x].data("starType"));
          }
        }).click({ level: id, rating: s + 1 }, function(event) {
          messageServer("rateLevel", event.data);
          // Display only your rating from now on
          for(var s = 0; s < 5; s++) {
            var starType;
            if(s < event.data.rating) {
              starType = "images/full-star.png";
            } else {
              starType = "images/empty-star.png";
            }
            var starImgs = $(this).data("starImgs");
            starImgs[s].prop("src", starType).data("starType", starType);
            container.data("rated", true);
          }
        }).css("cursor", "pointer");
      }
    }
    $(starImgs).each(function(i) {
      $(this).data({ starNum: i, starImgs: starImgs });
    });
    container.data({ completed: completed, rated: rated });
    return container;
  };

  callbacks.levelList = function(data) {
    for(var i = 0; i < data.length; i++) {
      var level = data[i];
      // Name
      var name = $(document.createElement("td")).text(level.name);
      // Completed
      var completed = $(document.createElement("td")).addClass("completed");
      if(level.completed) {
        var tick = $(document.createElement("img")).prop("src", "images/tick.png");
        completed.append(tick);
      }
      var rating = buildRating(level._id, level.completed, level.rating, level.rated);
      // Players
      // TODO use people icons
      var player = $(document.createElement("img")).prop("src", "images/blue-person-grey.png");
      var players = $(document.createElement("td")).addClass("players").append(player);
      // Play
      var play = $(document.createElement("input")).prop("type", "button");
      if(level.players > 1) {
        play.val("Join").click(level._id, joinLevel);
      } else {
        play.val("Play").click(level._id, function(event) {
          messageServer("playLevel", { _id: event.data });
          openMainLoading();
        });
      }
      // Edit
      var edit = $(document.createElement("input")).prop("type", "button").click(level._id, function(event) {
        messageServer("editLevel", { _id: event.data });
        openMainLoading();
      });
      var buttons = $(document.createElement("div")).append(play, edit).hide();
      if(level.own) {
        // Delete
        var del = $(document.createElement("input")).prop("type", "button").val("Delete").click(level._id, function(event) {
          messageServer("deleteLevel", { _id: event.data });
        });
        buttons.append(del);
        edit.val("Edit");
      } else {
        edit.val("Fork");
      }
      var buttonContainer = $(document.createElement("td")).append(buttons);
      var row = $(document.createElement("tr")).append(name, completed, rating, players, buttonContainer);
      row.data({ buttons: buttons, rating: rating });
      row.hover(function(event) {
        $(this).data("buttons").show();
      }, function(event) {
        $(this).data("buttons").hide();
      });
      $("#lobby-levels").append(row);
      levels[level._id] = row;
    }
  };

  var joinLevel = function(event) {
    messageServer("joinLevel", { level: event.data });
    $(this).val("Leave").click(event.data, leaveLevel);
  };

  var leaveLevel = function(event) {
    messageServer("leaveLevel", { level: event.data });
    $(this).val("Join").click(event.data, joinLevel);
  };

  // TODO What if a callback is recieved while the loading page is being displayed and levels is null
  callbacks.removeLevel = function(data) {
    if(data._id in levels) {
      levels[data._id].remove();
      delete levels[data._id];
    }
  };

  callbacks.updateRating = function(data) {
    if(data._id in levels) {
      var row = levels[data._id];
      var rated = row.data("rated");
      if(!rated) {
        var newRating = buildRating(data._id, row.data("completed"), data.rating, rated);
        newRating.insertBefore(row.data("rating"));
        row.data("rating").remove();
        row.data("rating", newRating);
      }
    }
  };

});
