"use strict";

$(document).ready(function(event) {

  $("#login-button").click(function(event) {
    var data = {
      username: $("#login-username").val(),
      password: $("#login-password").val()
    };
    messageServer("login", data);
    $("#login-pane").hide();
    $("#loading-pane").show();
  });

  $("#login-register").click(function(event) {
    $(".login-field").val("");
    $("#login-pane").hide();
    $("#register-pane").show();
    event.preventDefault();
  });

});

callbacks.loginSuccess = function(data) {
  $(".field").val("");
  // TODO: re-validate register form (i.e. clear error messages)
  localStorage.session = data.session;
  $("#home-username").text(data.username);
  $("#home-pane").show();
};

callbacks.loginFailure = function(data) {
  $("#login-password").val("");
  $("#login-pane").show();
  $("#login-password").focus();
  alert(JSON.stringify(data));
};
