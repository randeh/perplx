"use strict";

$(document).ready(function(event) {

  var Object = function(name) {
    if(arguments.length == 0) {
      return;
    }
    this.id = nextAvailableId++;
    this.name = name;
  };

  var Scene = function(name, width, height, color) {
    Object.apply(this, [name]);
    this.canvas = $(document.createElement("canvas")).attr("id", "editor-canvas");
    $("#editor-canvas-holder").append(this.canvas);
    this.canvas.css({
      "position": "absolute",
      "left": "50%",
      "top": "50%",
      "margin-left": -width / 2,
      "margin-top": -height / 2,
      "background-color": color
    });
    this.canvas.prop({ "width": width, "height": height });
    this.context = this.canvas[0].getContext("2d");
    this.width = width;
    this.height = height;
    this.color = color;
    this.children = [];
  };
  Scene.prototype = new Object();
  Scene.prototype.constructor = Scene;
  Scene.prototype.type = "Scene";
  Scene.prototype.setWidth = function(width) {
    this.width = width;
    this.canvas.prop({ "width": width });
    this.canvas.css({ "margin-left": -width / 2 });
  }
  Scene.prototype.setHeight = function(height) {
    this.height = height;
    this.canvas.prop({ "height": height });
    this.canvas.css({ "margin-top": -height / 2 });
  }
  Scene.prototype.setColor = function(color) {
    this.color = color;
    this.canvas.css({ "background-color": color });
  }
  Scene.prototype.getContext = function() {
    return this.context;
  }
/*
  var Group = function(name) {
    Object.apply(this, [name]);
    this.children = [];
  };
  Group.prototype = new Object();
  Group.prototype.constructor = Group;
  Group.prototype.type = "Group";
*/
  var Rect = function(name, color, x, y, width, height) {
    Object.apply(this, [name]);
    this.color = color;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  };
  Rect.prototype = new Object();
  Rect.prototype.constructor = Rect;
  Rect.prototype.type = "Rect";
  Rect.prototype.draw = function(context) {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);
  }

  var nextAvailableId = 0;
  var scene = new Scene("myGame", 700, 500, "#eeeeee");
  var context = scene.getContext();

  function getRandomColor() {
    var letters = "0123456789abcdef".split("");
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
  }

  $(scene).on("add", function(event, item) {
    // <li><input type="checkbox" id="tree-item-ID" /><label for="tree-item-ID">NAME</label></li>
    // give these a class for styling purposes?
    var checkbox = $(document.createElement("input")).prop("type", "checkbox").prop("id", "tree-item-" + item.id);
    var label = $(document.createElement("label")).prop("for", checkbox.attr("id")).text(item.name + " : " + item.type);
    var listItem = $(document.createElement("li")).append(checkbox).append(label);
    $("#editor-tree-list").append(listItem);
  });

  var draw = function() {
    context.clearRect(0, 0, scene.width, scene.height);
    for(var i = 0; i < scene.children.length; i++) {
      scene.children[i].draw(context);
    }
  };

  $("#editor-new-button").click(function(event) {
    var size = 100;
    var shape = new Rect("rect" + nextAvailableId, getRandomColor(), Math.random() * (scene.width - size), Math.random() * (scene.height - size), size, size);
    scene.children.push(shape);
    $(scene).trigger("add", shape);
    draw();
  });

});
