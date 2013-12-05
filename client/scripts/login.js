"use strict";

var openLogin;

$(document).ready(function(event) {

  openLogin = function() {
    if(closeCurrentWindow !== null) {
      closeCurrentWindow();
    }
    $("body").addClass("prelogin");
    $("#home-container").addClass("login").show();
    $("#login-pane").show();
    $("#login-email").focus();
    closeCurrentWindow = closeLogin;
  };

  var closeLogin = function() {
    $("body").removeClass("prelogin");
    $("#home-container").removeClass("login").hide();
    $("#login-pane").hide();
    $(".login-field").val("");
    $("#login-button").attr("disabled", "disabled");
    // TODO Clear error messages
    closeCurrentWindow = null;
  };

  var login = function() {
    if(!validateFields()) {
      return;
    }
    var data = {
      "email": $("#login-email").val(),
      "password": $("#login-password").val()
    };
    messageServer("login", data);
    openLoading();
  };

  $(".login-field").keypress(function(event) {
    if(event.which == 13) {
      login();
    }
  });

  $("#login-button").click(login);

  $("#login-register").click(function(event) {
    openRegister();
    event.preventDefault();
  });

  callbacks.loginSuccess = function(data) {
    localStorage.session = data["session"];
    openLobby();
  };

  callbacks.loginFailure = function(data) {
    openLogin();
    // TODO Display appropriate error message(s)
    alert(JSON.stringify(data)); // TEMP
  };

  var validateFields = function() {
    var email = validate.isValidEmail($("#login-email").val());
    var password = validate.isValidPassword($("#login-password").val());
    if(email && password) {
      $("#login-button").removeAttr("disabled");
      return true;
    } else {
      $("#login-button").attr("disabled", "disabled");
      return false;
    }
  }

  $(".login-field").on("input", validateFields);

});
