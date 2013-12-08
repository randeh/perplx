"use strict";

$(document).ready(function(event) {

  var levelData;
  var context;

  callbacks.openLevel = function(data) {
    if(closeCurrentWindow !== null) {
      closeCurrentWindow();
    }
    $("#main-container").show();
    $("#play-pane").show();
    levelData = data;
    var canvas = $(document.createElement("canvas")).css({
      "position": "absolute",
      "left": "50%",
      "top": "50%",
      "margin-left": -data.width.value / 2,
      "margin-top": -data.height.value / 2,
      "background-color": data.backgroundColor.value
    }).prop({ "width": data.width.value, "height": data.height.value });
    $("#play-pane").append(canvas);
    context = canvas[0].getContext("2d");
    closeCurrentWindow = closePlay;
  };

  var closePlay = function() {
    $("#main-container").hide();
    $("#play-pane").empty().hide();
    levelData = null;
    context = null;
    closeCurrentWindow = null;
  };

});