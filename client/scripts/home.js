"use strict";

var openHome;
var closeHome;

$(document).ready(function(event) {

  $("#home-logout-button").click(function(event) {
    messageServer("logout", {});
    closeHome();
    $("#loading-pane").show();
  });

  $("#home-editor").click(function(event) {
    closeHome();
    openEditor();
    event.preventDefault();
  });

  openHome = function() {
    $("#home-username").text(sessionStorage.username);
    $("#home-pane").show();
  };

  closeHome = function() {
    $("#home-pane").hide();
  };

});

callbacks.logoutSuccess = function() {
  delete localStorage.session;
  $("#loading-pane").hide();
  openLogin();
};
