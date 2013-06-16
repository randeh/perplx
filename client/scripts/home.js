"use strict";

$(document).ready(function(event) {

  $("#home-logout-button").click(function(event) {
    messageServer("logout", {});
    $("#home-pane").hide();
    $("#loading-pane").show();
  });

});

callbacks.logoutSuccess = function() {
  delete localStorage.session;
  $("#home-username").text("");
  $("#loading-pane").hide();
  $("#login-pane").show();
};
