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
    $(".register-field").val("").removeClass("invalid");
    $("#register-button").attr("disabled", "disabled");
    $(".register-tip").hide();
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

  $("#register-name").focus(function(event) {
    $("#register-tip-name").show();
  });
  $("#register-name").blur(function(event) {
    $("#register-tip-name").hide();
  });

  $("#register-password").focus(function(event) {
    $("#register-tip-password").show();
  });
  $("#register-password").blur(function(event) {
    $("#register-tip-password").hide();
  });

  var validateFields = function() {
    var fields = [$("#register-name"), $("#register-email"), $("#register-password"), $("#register-password2")];
    var valid = new Array();
    valid[0] = validate.isValidName(fields[0].val());
    valid[1] = validate.isValidEmail(fields[1].val());
    valid[2] = validate.isValidPassword(fields[2].val());
    valid[3] = valid[2] && fields[3].val() == fields[2].val();
    for(var i = 0; i < fields.length; i++) {
      if(!valid[i] && fields[i].val() != "") {
        fields[i].addClass("invalid");
      } else {
        fields[i].removeClass("invalid");
      }
    }
    if(valid[0] && valid[1] && valid[2] && valid[3]) {
      $("#register-button").removeAttr("disabled");
      return true;
    } else {
      $("#register-button").attr("disabled", "disabled");
      return false;
    }
  };

  $(".register-field").on("input", validateFields);

});
