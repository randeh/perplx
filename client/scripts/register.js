"use strict";

// Add functionality to check name availability

$(document).ready(function(event) {

/*
  $("#register-username").blur(function(event) {
    if(isValidUsername($("#register-username").val())) {
      //
    }
  });

  // make the fields belong to a class and do something like this:
  colourFields = function() {
    // blah
  }
  $(".register-fields").blur(colourFields).keyup(colourFields);
*/

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
    var data = {
      username: $("#register-username").val(),
      email: $("#register-email").val(),
      password: $("#register-password").val()
    };
    messageServer("register", data);
    $("#register-pane").hide();
    $("#loading-pane").show();
  });

});

callbacks.registerFailure = function(data) {
  // re-validate form
  $("#register-pane").show();
  alert(data.message); // TEMP
};
