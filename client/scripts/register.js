"use strict";

var openRegister;

$(document).ready(function(event) {

  var nameAvailable = false;

  openRegister = function() {
    if(closeCurrentWindow !== null) {
      closeCurrentWindow();
    }
    $("#github-ribbon").show();
    $("body").addClass("prelogin");
    $("#home-container").addClass("register").show();
    $("#register-pane").show();
    $("#register-name").focus();
    closeCurrentWindow = closeRegister;
  };

  var closeRegister = function() {
    $("#github-ribbon").hide();
    $("body").removeClass("prelogin");
    $("#home-container").removeClass("register").hide();
    $("#register-pane").hide();
    $(".register-field").val("").removeClass("invalid");
    $("#register-button").attr("disabled", "disabled");
    $(".register-tip").hide();
    $("#register-name").removeClass("unavailable");
    $("#register-error").text("");
    closeCurrentWindow = null;
  };

  var register = function() {
    if(!validateFields() || !nameAvailable) {
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

  var checkName = function() {
    nameAvailable = false;
    $(".register-tip-availability").hide();
    $("#register-name").removeClass("unavailable");
    if(validate.isValidName($("#register-name").val())) {
      messageServer("checkAvailability", { "name": $("#register-name").val() });
    }
  };

  $("#register-name").on("input", checkName);

  callbacks.nameAvailable = function(data) {
    if(data["name"] == $("#register-name").val()) {
      nameAvailable = true;
      validateFields();
      $("#register-tip-available").show();
    }
  };

  callbacks.nameUnavailable = function(data) {
    if(data["name"] == $("#register-name").val()) {
      nameAvailable = false;
      $("#register-tip-unavailable").show();
      $("#register-name").addClass("unavailable");
    }
  };

  callbacks.registerSuccess = function(data) {
    localStorage.session = data["session"];
    openLobby();
  };

  callbacks.registerFailure = function(data) {
    openRegister();
    $("#register-name").val(data.name);
    $("#register-email").val(data.email);
    $("#register-password").val(data.password);
    $("#register-password2").val(data.password);
    validateFields();
    checkName();
    $("#register-error").text(data.message);
  };

  var fieldTips = ["name", "email", "password"];
  for(var i = 0; i < fieldTips.length; i++) {
    var field = fieldTips[i];
    $("#register-" + field).focus(field, function(event) {
      $("#register-tip-" + event.data).show();
    }).blur(field, function(event) {
      $("#register-tip-" + event.data).hide();
    });
  }

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
    if(valid[0] && valid[1] && valid[2] && valid[3] && nameAvailable) {
      $("#register-button").removeAttr("disabled");
      return true;
    } else {
      $("#register-button").attr("disabled", "disabled");
      return false;
    }
  };

  $(".register-field").on("input", validateFields);

});
