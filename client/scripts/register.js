"use strict";

var openRegister;

$(document).ready(function(event) {

  openRegister = function() {
    if(closeCurrentWindow !== null) {
      closeCurrentWindow();
    }
    $("body").addClass("prelogin");
    $("#home-container").addClass("register").show();
    $("#register-pane").show();
    $("#register-name").focus();
    closeCurrentWindow = closeRegister;
  };

  var closeRegister = function() {
    $("body").removeClass("prelogin");
    $("#home-container").removeClass("register").hide();
    $("#register-pane").hide();
    $(".register-field").val("");
    $("#register-button").attr("disabled", "disabled");
    // TODO Clear error messages
    closeCurrentWindow = null;
  };

  var register = function() {
    if(!validateFields()) {
      return;
    }
    var data = {
      "name": $("#register-name").val(),
      "email": $("#register-email").val(),
      "password": $("#register-password").val()
    };
    messageServer("register", data);
    openLoading();
  };


  $(".register-field").keypress(function(event) {
    if(event.which == 13) {
      register();
    }
  });

  $("#register-button").click(register);

  $("#register-login").click(function(event) {
    openLogin();
    event.preventDefault();
  });

  callbacks.nameAvailable = function(data) {
    // TODO check data["name"] matches current field content, then update message
  };

  callbacks.nameUnavailable = function(data) {
    // TODO check data["name"] matches current field content, then update message
  };

  callbacks.registerSuccess = function(data) {
    localStorage.session = data["session"];
    openLobby();
  };

  callbacks.registerFailure = function(data) {
    openRegister();
    // TODO Display appropriate error message(s)
    alert(JSON.stringify(data)); // TEMP
  };

  var validateFields = function() {
    // TODO Tell the user what's wrong?
    var name = validate.isValidName($("#register-name").val());
    var email = validate.isValidEmail($("#register-email").val());
    var password = validate.isValidPassword($("#register-password").val());
    var password2 = password && $("#register-password").val() == $("#register-password2").val();
    if(name && email && password && password2) {
      $("#register-button").removeAttr("disabled");
      return true;
    } else {
      $("#register-button").attr("disabled", "disabled");
      return false;
    }
  };

  $(".register-field").on("input", validateFields);

});
