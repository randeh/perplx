"use strict";

var openLobby;

$(document).ready(function(event) {

  openLobby = function() {
    if(closeCurrentWindow !== null) {
      closeCurrentWindow();
    }
    $("#main-container").show();
    $("#lobby-pane").show();
    closeCurrentWindow = closeLobby;
  };

  var closeLobby = function() {
    $("#main-container").hide();
    $("#lobby-pane").hide();
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

});
