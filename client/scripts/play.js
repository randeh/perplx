"use strict";

$(document).ready(function(event) {

  callbacks.openLevel = function(data) {
    if(closeCurrentWindow !== null) {
      closeCurrentWindow();
    }
    $("#main-container").show();
    scene = buildLevel(JSON.parse(data));
    $("#play-pane").show().append(scene.canvas);
    scene.draw();
    mode = "play";
    closeCurrentWindow = closePlay;
  };

  var closePlay = function() {
    $("#main-container").hide();
    $("#play-pane canvas").remove();
    $("#play-pane").hide();
    mode = "";
    scene = null;
    closeCurrentWindow = null;
  };

  $("#play-exit-button").click(function(event) {
    messageServer("exitPlay", {});
    openMainLoading();
  });

});
