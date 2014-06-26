"use strict";

$(document).ready(function(event) {

  callbacks.openLevel = function(data) {
    if(closeCurrentWindow !== null) {
      closeCurrentWindow();
    }
    $("#main-container").show();
    usedNames = {};
    scene = buildLevel(JSON.parse(data));
    $("#play-pane").show().append(scene.canvas);
    scene.draw();
    mode = "play";
    closeCurrentWindow = closePlay;
  };

  var closePlay = function() {
    $("#main-container").hide();
    scene.canvas.remove();
    $("#play-pane").hide();
    mode = "";
    scene = null;
    usedNames = {};
    closeCurrentWindow = null;
  };

  $("#play-exit-button").click(function(event) {
    messageServer("exitPlay", {});
    openMainLoading();
  });

});
