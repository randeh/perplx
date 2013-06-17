"use strict";

// TODO maybe have an init function for each pane
// eg, initHome would clear #home-username and empty the list of levels etc.

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
