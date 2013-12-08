"use strict";

var openLobby;

$(document).ready(function(event) {

  openLobby = function() {
    if(closeCurrentWindow !== null) {
      closeCurrentWindow();
    }
    $("#main-container").show();
    $("#lobby-pane").show();
    messageServer("getLevels", {});
    closeCurrentWindow = closeLobby;
  };

  var closeLobby = function() {
    $("#main-container").hide();
    $("#lobby-pane").hide();
    $("#lobby-levels").empty();
    closeCurrentWindow = null;
  };

  $("#logout-button").click(function(event) {
    messageServer("logout", {});
    openLoading();
  });

  callbacks.logoutSuccess = function(data) {
    delete localStorage.session;
    openLogin();
  };

  $("#lobby-editor").click(function(event) {
    openEditor();
    event.preventDefault();
  });

  callbacks.levelList = function(data) {
    for(var i = 0; i < data.length; i++) {
      var level = data[i];
      var name = $(document.createElement("span")).text(level.name);
      var play = $(document.createElement("input")).prop("type", "button").val("Play").click(level._id, function(event) {
        messageServer("playLevel", event.data);
        openLoading();
      });
      var container = $(document.createElement("div")).append(name).append(play);
      $("#lobby-levels").append(container);
    }
  };

});
