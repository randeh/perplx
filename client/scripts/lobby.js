"use strict";

$(document).ready(function(event) {

  $("#logout-button").click(function(event) {
    messageServer("logout", {});
  });

  callbacks.logoutSuccess = function(data) {
    delete localStorage.session;
  };

  $("#lobby-editor").click(function(event) {
    $("#lobby-pane").hide();
    $("#editor-pane").show();
    event.preventDefault();
  });

});
