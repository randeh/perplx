"use strict";

var openLogin;
var closeLogin;

$(document).ready(function(event) {

  $("#login-button").click(function(event) {
    var data = {
      username: $("#login-username").val(),
      password: $("#login-password").val()
    };
    messageServer("login", data);
    closeLogin();
    $("#loading-pane").show();
  });

  $("#login-register").click(function(event) {
    closeLogin();
    openRegister();
    event.preventDefault();
  });

  openLogin = function() {
    $("#login-pane").show();
  };

  closeLogin = function() {
    $("#login-pane").hide();
    $(".login-field").val("");
  };

});

callbacks.loginSuccess = function(data) {
  $("#loading-pane").hide();
  localStorage.session = data.session;
  sessionStorage.username = data.username;
  openHome();
};

callbacks.loginFailure = function(data) {
  $("#loading-pane").hide();
  openLogin();
  alert(JSON.stringify(data)); // TEMP
};
