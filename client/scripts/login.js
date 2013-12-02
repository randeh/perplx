"use strict";

// TODO disable login button until fields validate?

$(document).ready(function(event) {

  $("#login-button").click(function(event) {
    var data = {
      "email": $("#login-email").val(),
      "password": $("#login-password").val()
    };
    messageServer("login", data);
    $("#login-pane").hide();
    $("#loading-spinner").show();
  });

  $("#login-register").click(function(event) {
    $("#login-pane").hide();
    $(".login-field").val("");
    $("#home-container").removeClass("login").addClass("register");
    $("#register-pane").show();
    event.preventDefault();
  });

  callbacks.loginSuccess = function(data) {
    localStorage.session = data["session"];
    $(".login-field").val("");
    $("#loading-spinner").hide();
    $("#home-container").hide();
    $("body").removeClass("prelogin");
    $("#main-container").show();
    $("#lobby-pane").show();
  };

  callbacks.loginFailure = function(data) {
    $("#loading-spinner").hide();
    $("#login-pane").show();
    // TODO Display some kind of error message
    alert(JSON.stringify(data)); // TEMP
  };

});
