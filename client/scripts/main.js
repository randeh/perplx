"use strict";

var closeCurrentWindow = null;
var openHomeLoading;
var openMainLoading;
var scene;
var mode;

$(document).ready(function(event) {

  openHomeLoading = function() {
    if(closeCurrentWindow !== null) {
      closeCurrentWindow();
    }
    $("#github-ribbon").show();
    $("body").addClass("prelogin");
    $("#home-container").show();
    $("#home-loading-spinner").show();
    closeCurrentWindow = closeHomeLoading;
  };

  var closeHomeLoading = function() {
    $("#github-ribbon").hide();
    $("body").removeClass("prelogin");
    $("#home-container").hide();
    $("#home-loading-spinner").hide();
    closeCurrentWindow = null;
  };

  openMainLoading = function() {
    if(closeCurrentWindow !== null) {
      closeCurrentWindow();
    }
    $("#main-container").show();
    $("#main-loading-spinner").show();
    closeCurrentWindow = closeMainLoading;
  };

  var closeMainLoading = function() {
    $("#main-container").hide();
    $("#main-loading-spinner").hide();
    closeCurrentWindow = null;
  };

});
