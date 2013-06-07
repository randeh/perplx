"use strict";

window.addEventListener("load", function(event) {
  var loadingPane = document.getElementById("loading-pane");

  var loginPane = document.getElementById("login-pane");
  var loginUsername = document.getElementById("login-username");
  var loginPassword = document.getElementById("login-password");
  var loginButton = document.getElementById("login-button");
  var loginRegister = document.getElementById("login-register");

  var registerPane = document.getElementById("register-pane");
  var registerUsername = document.getElementById("register-username");
  var registerEmail = document.getElementById("register-email");
  var registerPassword = document.getElementById("register-password");
  var registerPassword2 = document.getElementById("register-password2");
  var registerButton = document.getElementById("register-button");

  var homePane = document.getElementById("home-pane");
  var homeUsername = document.getElementById("home-username");

  var socket = new WebSocket("ws://localhost:8080");

  loginButton.addEventListener("click", function(event) {
    var query = {
      category: "account",
      activity: "login",
      username: loginUsername.value,
      password: loginPassword.value
    };
    var queryString = JSON.stringify(query);
    socket.send(queryString);
    loginPane.style.visibility = "none";
    loadingPane.style.visibility = "visible";
  });

  loginRegister.addEventListener("click", function(event) {
    loginPane.style.visibility = "none";
    registerPane.style.visibility = "visible";
    return false; // JQuery: event.preventDefault();
  });

  registerButton.addEventListener("click", function(event) {
    var username = registerUsername.value;
    var email = registerEmail.value;
    var password = registerPassword.value;
    var password2 = registerPassword2.value;
    // In the future, perform this validation as the form is filled
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
    var query = {
      category: "account",
      activity: "register",
      username: username,
      email: email,
      password: password
    };
    var queryString = JSON.stringify(query);
    socket.send(queryString);
    registerPane.style.visibility = "none";
    loadingPane.style.visibility = "visible";
  });

  socket.addEventListener("open", function(event) {
    // Display login screen once the socket is open
    loadingPane.style.visibility = "none";
    loginPane.style.visibility = "visible";
  });

  socket.addEventListener("message", function(event) {
    loadingPane.style.visibility = "none";
    var response = JSON.parse(event.data);
    switch(response.category) {
      case "account":
        switch(response.activity) {
          case "login":
            if(response.success) {
              // Clear the fields to prevent re-logging in after log out
              loginUsername.value = "";
              loginPassword.value = "";
              homePane.style.visibility = "visible";
              homeUsername.textContent = response.username;
            } else {
              loginPassword.value = "";
              loginPane.style.visibility = "visible";
              loginPassword.focus();
              alert(response.message);
            }
            break;
          case "register":
            if(response.success) {
              registerUsername.value = "";
              registerEmail.value = "";
              registerPassword.value = "";
              registerPassword2.value = "";
              homePane.style.visibility = "visible";
              homeUsername.textContent = response.username;
            } else {
              registerPane.style.visibility = "visible";
              alert(response.message);
            }
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  });

  socket.addEventListener("error", function(event) {
    alert("WebSocket Error: " + error);
  });

  socket.addEventListener("close", function(event) {
    // TODO hide all panes
    // JQuery: $(".pane").hide();
    loadingPane.style.visibility = "visible";
  });

});
