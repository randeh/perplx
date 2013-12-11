"use strict";

$(document).ready(function(event) {

  callbacks.openLevel = function(data) {
    if(closeCurrentWindow !== null) {
      closeCurrentWindow();
    }
    $("#main-container").show();
    $("#play-pane").show();
    mode = "play";
    scene = buildLevel(data);
    $("#play-pane").append(scene.canvas);
    scene.draw();
    closeCurrentWindow = closePlay;
  };

  var closePlay = function() {
    $("#main-container").hide();
    $("#play-pane").empty().hide();
    mode = "";
    scene = null;
    closeCurrentWindow = null;
  };

  var buildLevel = function(data) {
    var object = new objects[data.type](data.properties);
    if(object.isContainer) {
      for(var i = 0; i < data.children.length; i++) {
        var child = buildLevel(data.children[i]);
        object.addChild(child);
      }
    }
    return object;
  };

});