"use strict";

// TODO Add functionality to check name availability

$(document).ready(function(event) {

  $("#register-button").click(function(event) {
    var data = {
      "name": $("#register-name").val(),
      "email": $("#register-email").val(),
      "password": $("#register-password").val()
    };
    messageServer("register", data);
    $("#register-pane").hide();
    $("#loading-spinner").show();
  });

  $("#register-login").click(function(event) {
    $("#register-pane").hide();
    $(".register-field").val("");
    validateFields();
    $("#home-container").removeClass("register").addClass("login");
    $("#login-pane").show();
    event.preventDefault();
  });

  callbacks.nameAvailable = function(data) {
    //check data["name"] matches current field content, then update message
  };

  callbacks.nameUnavailable = function(data) {
    //check data["name"] matches current field content, then update message
  };

  callbacks.registerSuccess = function(data) {
    localStorage.session = data["session"];
    $(".register-field").val("");
    validateFields();
    $("#loading-spinner").hide();
    $("#home-container").hide();
    $("body").removeClass("prelogin");
    $("#main-container").show();
    $("#lobby-pane").show();
    // TODO Maybe go to a tutorial
  };

  callbacks.registerFailure = function(data) {
    $("#loading-spinner").hide();
    validate();
    $("#register-pane").show();
    // TODO Display error if registration failed for some reason beyond user control
    alert(JSON.stringify(data)); // TEMP
  };

  var validateFields = function() {
    //
  };

});

/*
var validateFields = function() {
  var $name = $("#register-name");
  var nameValid = validate.isValidName($name.val());
  if(nameValid) {
    $name.removeClass("invalid");
  } else {
    $name.addClass("invalid");
  }
  var $email = $("#register-email");
  var emailValid = validate.isValidEmail($email.val());
  if(emailValid) {
    $email.removeClass("invalid");
  } else {
    $email.addClass("invalid");
  }
  var $password = $("#register-password");
  var passwordValid = validate.isValidPassword($password.val());
  if(passwordValid) {
    $password.removeClass("invalid");
  } else {
    $password.addClass("invalid");
  }
  var $password2 = $("#register-password2");
  var password2Valid = passwordValid && $password2.val() === $password.val();
  if(password2Valid) {
    $password2.removeClass("invalid");
  } else {
    $password2.addClass("invalid");
  }
  // Enable/disable the register button
  if(nameValid && emailValid && passwordValid && password2Valid) {
    $("#register-button").removeAttr("disabled");
  } else {
    $("#register-button").addAttr("disabled", "disabled");
  }
};

$(".register-field").keyup(validateFields);
*/
