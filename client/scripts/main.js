"use strict";

var closeCurrentWindow = null;
var openLoading;

$(document).ready(function(event) {

  openLoading = function() {
    if(closeCurrentWindow !== null) {
      closeCurrentWindow();
    }
    $("body").addClass("prelogin");
    $("#home-container").show();
    $("#loading-spinner").show();
    closeCurrentWindow = closeLoading;
  };

  var closeLoading = function() {
    $("body").removeClass("prelogin");
    $("#home-container").hide();
    $("#loading-spinner").hide();
    closeCurrentWindow = null;
  };

  openLoading();

});
