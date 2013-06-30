"use strict";

$(document).ready(function(event) {

  $("#logout-button").click(function(event) {
    messageServer("logout", {});
  });

  callbacks.logoutSuccess = function(data) {
    delete localStorage.session;
  };

});
