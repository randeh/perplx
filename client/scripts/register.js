"use strict";

// Add functionality to check name availability

var openRegister;
var closeRegister;

$(document).ready(function(event) {

  var validateFields = function() {
    var $username = $("#register-username");
    var usernameValid = validate.isValidUsername($username.val());
    if(usernameValid) {
      $username.removeClass("invalid");
    } else {
      $username.addClass("invalid");
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
    if(usernameValid && emailValid && passwordValid && password2Valid) {
      $("#register-button").removeAttr("disabled");
    } else {
      $("#register-button").addAttr("disabled", "disabled");
    }
  };

  $(".register-fields").keyup(validateFields);

  // onfocus display relevant tips
  // onblur hide tips

  $("#register-button").click(function(event) {
    var data = {
      username: $("#register-username").val(),
      email: $("#register-email").val(),
      password: $("#register-password").val()
    };
    messageServer("register", data);
    $("#register-pane").hide();
    $("#loading-pane").show();
  });

  openRegister = function() {
    $(".register-field").val("");
    validateFields();
    $("#register-pane").show();
  };

  closeRegister = function() {
    $("#register-pane").hide();
  };

  callbacks.registerFailure = function(data) {
    validateFields();
    $("#register-pane").show();
    alert(JSON.stringify(data)); // TEMP
  };

});
