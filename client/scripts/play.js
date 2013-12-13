"use strict";

$(document).ready(function(event) {

  var openPlay = function() {
    if(closeCurrentWindow !== null) {
      closeCurrentWindow();
    }
    $("#main-container").show();
    $("#play-pane").show();
    mode = "play";
    closeCurrentWindow = closePlay;
  };

  var closePlay = function() {
    $("#main-container").hide();
    $("#play-pane").empty().hide();
    mode = "";
    scene = null;
    closeCurrentWindow = null;
  };

  callbacks.openLevel = function(data) {
    openPlay();
    scene = buildLevel(JSON.parse(data));
    $("#play-pane").append(scene.canvas);
    scene.draw();
  };

});