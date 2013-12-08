"use strict";

var openLogin;

$(document).ready(function(event) {

  openLogin = function() {
    if(closeCurrentWindow !== null) {
      closeCurrentWindow();
    }
    $("#github-ribbon").show();
    $("body").addClass("prelogin");
    $("#home-container").addClass("login").show();
    $("#login-pane").show();
    $("#login-email").focus();
    closeCurrentWindow = closeLogin;
  };

  var closeLogin = function() {
    $("#github-ribbon").hide();
    $("body").removeClass("prelogin");
    $("#home-container").removeClass("login").hide();
    $("#login-pane").hide();
    $(".login-field").val("");
    $("#login-button").prop("disabled", true);
    $("#login-error").text("");
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
    $("#login-email").val(data.email);
    $("#login-password").val(data.password);
    $("#login-error").text(data.message);
  };

  var validateFields = function() {
    var emailValid = validate.isValidEmail($("#login-email").val());
    var passwordValid = validate.isValidPassword($("#login-password").val());
    if(emailValid && passwordValid) {
      $("#login-button").prop("disabled", false);
      return true;
    } else {
      $("#login-button").prop("disabled", true);
      return false;
    }
  }

  $(".login-field").on("input", validateFields);

});
