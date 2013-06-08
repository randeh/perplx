"use strict";

var loginSuccess;
var loginFailure;

$(document).ready(function(event) {

  $("#login-button").click(function(event) {
    var query = {
      activity: "login",
      username: $("#login-username").val(),
      password: $("#login-password").val()
    };
    var queryString = JSON.stringify(query);
    socket.send(queryString);
    $("#login-pane").hide();
    $("#loading-pane").show();
  });

  $("#login-register").click(function(event) {
    $("#login-username").val("");
    $("#login-password").val("");
    $("#login-pane").hide();
    $("#register-pane").show();
    event.preventDefault();
  });

  loginSuccess = function(data) {
    $("#login-username").val("");
    $("#login-password").val("");
    $("#home-pane").show();
    $("#home-username").text(data.username);
  };

  loginFailure = function(data) {
    $("#login-password").val("");
    $("#login-pane").show();
    $("#login-password").focus();
    alert(data.message);
  };

});