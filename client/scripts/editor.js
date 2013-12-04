"use strict";

$(document).ready(function(event) {

  // Fields: [name (no formula allowed) : String, width : Number, height : Number, color : Color, x : Number, y : Number]
  // use this["name"] instead of this.name to bypass minification

  // Next Task?
  // expand/collapse groups
  // hide checkboxes and only allow selection of one object at a time
  // populate inspector pane with fields when an object is selected
  // choose what type of object you want to create
  // add new objects to the selected group rather than always top-level

/*
<li>
<img src="images/minus.png">
<span>myGroup : Group</span>
<ol>
...
</ol>
</li>
*/

  var Object = function(name) {
    if(arguments.length == 0) {
      return;
    }
    this.id = nextAvailableId++;
    this.name = { "value": name, "method": "setName" };
    this.children = [];
    var 
    var checkbox = $(document.createElement("input")).prop("type", "checkbox").prop("id", "tree-item-" + this.id);
    this.label = $(document.createElement("label")).prop("for", checkbox.attr("id")).text(this.name.value + " : " + this.type);
    this.listItem = $(document.createElement("li")).append(this.label).append(checkbox);
    if(this.type == "Scene" || this.type == "Group") {
      this.childrenList = $(document.createElement("ol")).addClass("tree");
      this.listItem.append(this.childrenList);
    }
  };
  Object.prototype.setName = function(name) {
    this.name.value = name;
    this.label.text(name + " : " + this.type);
  }
  Object.prototype.addChild = function(child) {
    this.children.push(child);
    this.childrenList.append(child.listItem);
  }

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
    this.width = { "value": width, "method": "setWidth" };
    this.height = { "value": height, "method": "setHeight" };
    this.color = { "value": color, "method": "setColor" };
  };
  Scene.prototype = new Object();
  Scene.prototype.constructor = Scene;
  Scene.prototype.type = "Scene";
  Scene.prototype.setWidth = function(width) {
    this.width.value = width;
    this.canvas.prop({ "width": width });
    this.canvas.css({ "margin-left": -width / 2 });
  }
  Scene.prototype.setHeight = function(height) {
    this.height.value = height;
    this.canvas.prop({ "height": height });
    this.canvas.css({ "margin-top": -height / 2 });
  }
  Scene.prototype.setColor = function(color) {
    this.color.value = color;
    this.canvas.css({ "background-color": color });
  }

  var Group = function(name) {
    Object.apply(this, [name]);
  };
  Group.prototype = new Object();
  Group.prototype.constructor = Group;
  Group.prototype.type = "Group";

  var Rect = function(name, color, x, y, width, height) {
    Object.apply(this, [name]);
    this.color = { "value": color };
    this.x = { "value": x };
    this.y = { "value": y };
    this.width = { "value": width };
    this.height = { "value": height };
  };
  Rect.prototype = new Object();
  Rect.prototype.constructor = Rect;
  Rect.prototype.type = "Rect";
  Rect.prototype.draw = function(context) {
    context.fillStyle = this.color.value;
    context.fillRect(this.x.value, this.y.value, this.width.value, this.height.value);
  }

  var nextAvailableId = 0;
  var scene = new Scene("myGame", 700, 500, "#eeeeee");
  $("#editor-tree-list").append(scene.listItem);
  var context = scene.context;

  var draw = function() {
    context.clearRect(0, 0, scene.width.value, scene.height.value);
    for(var i = 0; i < scene.children.length; i++) {
      scene.children[i].draw(context);
    }
  };

  function getRandomColor() {
    var letters = "0123456789abcdef".split("");
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
  }

  $("#editor-new-button").click(function(event) {
    var size = 100;
    var color = getRandomColor();
    var shape = new Rect("rect " + color, color, Math.random() * (scene.width.value - size), Math.random() * (scene.height.value - size), size, size);
    scene.addChild(shape);
    draw();
  });

});
