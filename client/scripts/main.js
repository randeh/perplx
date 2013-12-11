"use strict";

var closeCurrentWindow = null;
var openLoading;
var scene;
var mode;

$(document).ready(function(event) {

  openLoading = function() {
    if(closeCurrentWindow !== null) {
      closeCurrentWindow();
    }
    $("#github-ribbon").show();
    $("body").addClass("prelogin");
    $("#home-container").show();
    $("#loading-spinner").show();
    closeCurrentWindow = closeLoading;
  };

  var closeLoading = function() {
    $("#github-ribbon").hide();
    $("body").removeClass("prelogin");
    $("#home-container").hide();
    $("#loading-spinner").hide();
    closeCurrentWindow = null;
  };

  openLoading();

});
