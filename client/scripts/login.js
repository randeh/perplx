"use strict";

$(document).ready(function(event) {

  $("#login-button").click(function(event) {
    var message = {
      activity: "login",
      username: $("#login-username").val(),
      password: $("#login-password").val()
    };
    messageServer(message);
    $("#login-pane").hide();
    $("#loading-pane").show();
  });

  $("#login-register").click(function(event) {
    $("#login-username").val("");
    $("#login-password").val("");
    $("#login-pane").hide();
    $("#register-pane").show();
    event.preventDefault();
  });

});

callbacks.loginSuccess = function(data) {
  $("#login-username").val("");
  $("#login-password").val("");
  sessionId = data.session;
  // TODO: also save session as a cookie
  $("#home-username").text(data.username);
  $("#home-pane").show();
};

callbacks.loginFailure = function(data) {
  $("#login-password").val("");
  $("#login-pane").show();
  $("#login-password").focus();
  alert(data.message);
};
