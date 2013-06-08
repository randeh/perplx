"use strict";

// Add functionality to check name availability

$(document).ready(function(event) {

  $("#register-username").focus(function(event) {
    if(isValidUsername(this.val())) {

    }
  });

/*
  // TODO In the future, perform this validation as the form is filled
  // enable/disable the register button based on the correctness
  if(!isValidUsername(username)) {
    alert("Invalid username");
    return;
  }
  if(!isValidEmail(email)) {
    alert("Invalid email");
    return;
  }
  if(!isValidPassword(password)) {
    alert("Invalid password");
    return;
  }
  if(password !== password2) {
    alert("Passwords do not match");
    return;
  }
*/

  // onfocus colour box, display relevant tips
  // onkeyup colour box
  // onblur reset colour if empty, hide tips

  // ^ also enable/disable register button as form is completed

  $("#register-button").click(function(event) {
    var query = {
      activity: "register",
      username: $("#register-username").val(),
      email: $("#register-email").val(),
      password: $("#register-password").val()
    };
    var queryString = JSON.stringify(query);
    messageServer(queryString);
    $("#register-pane").hide();
    $("#loading-pane").show();
  });

  callbacks.registerSuccess = function(data) {
    $("#register-username").val("");
    $("#register-email").val("");
    $("#register-password").val("");
    $("#register-password2").val("");
    $("#home-pane").show();
    $("#home-username").text(data.username);
  };

  callbacks.registerFailure = function(data) {
    // re-validate and colour fields/submit button
    $("#register-pane").show();
    alert(data.message);
  }

});