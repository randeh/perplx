"use strict";

$(document).ready(function(event) {

  var fields = [
    { name: "name",            display: "Name",             htmlType: "text",   type: "string"  },
    { name: "width",           display: "Width",            htmlType: "number", type: "integer" },
    { name: "height",          display: "Height",           htmlType: "number", type: "integer" },
    { name: "backgroundColor", display: "Background Color", htmlType: "color",  type: "color"   },
    { name: "lineColor",       display: "Line Color",       htmlType: "color",  type: "color"   },
    { name: "x",               display: "X Position",       htmlType: "number", type: "integer" },
    { name: "y",               display: "Y Position",       htmlType: "number", type: "integer" }
  ];

  // Next Task?
  // allow formulae as input (except for names & maybe colors)

  // anywhere .css() is used, could it be improved with static css and adding/removing classes?
  // use this["name"] instead of this.name so nothing breaks if the code is ever minified

  var Object = function(name) {
    if(arguments.length == 0) {
      return;
    }
    this.id = nextAvailableId++;
    this.name = { "value": name, "method": "setName" };
    this.label = $(document.createElement("span")).text(this.name.value + " : " + this.type).css("cursor", "pointer");
    var obj = this;
    this.label.click(function(event) { obj.select() });
    this.listItem = $(document.createElement("li")).append(this.label);
    if(this.isContainer) {
      this.children = [];
      this.button = $(document.createElement("img")).prop("src", "images/plus.png").css("cursor", "pointer");
      this.childrenList = $(document.createElement("ol")).addClass("tree").hide();
      this.button.click(function(event) { obj.expand() });
      this.listItem.prepend(this.button).append(this.childrenList);
    }
  };
  Object.prototype.isContainer = false;
  Object.prototype.isDrawable = false;
  Object.prototype.setName = function(name) {
    this.name.value = name;
    this.label.text(this.name.value + " : " + this.type);
  };
  Object.prototype.addChild = function(child) {
    this.children.push(child);
    this.childrenList.append(child.listItem);
    child.parent = this;
  };
  Object.prototype.select = function() {
    if(selected !== null) {
      selected.deselect();
    }
    selected = this;
    this.label.addClass("selected");
    if(this.isContainer) {
      this.expand();
    }
    this.inspect();
    var obj = this;
    this.label.off("click").click(function(event) { obj.deselect() });
  };
  Object.prototype.deselect = function() {
    selected = null;
    this.label.removeClass("selected");
    $("#editor-properties").empty();
    var obj = this;
    this.label.off("click").click(function(event) { obj.select() });
  };
  Object.prototype.inspect = function() {
    var obj = this;
    for(var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if(this[field.name] !== undefined) {
        var id = field.name + this.id;
        var label = $(document.createElement("label")).prop("for", id).text(field.display + ":");
        var container = $(document.createElement("div")).append(label);
        var input;
        switch(field.type) {
          default:
            input = $(document.createElement("input")).prop({ "id": id, "type": field.htmlType, "value": this[field.name].value });
            input.change({ field: field, input: input }, function(event) {
              var field = event.data.field;
              var input = event.data.input;
              if(obj[field.name].method !== undefined) {
                obj[obj[field.name].method](input.val());
              } else {
                obj[field.name].value = input.val();
              }
              if(obj.isDrawable && field.name != "name") {
                draw();
              }
            });
            container.append(input);
            break;
        }
        $("#editor-properties").append(container);
      }
    }
  }
  Object.prototype.expand = function() {
    this.childrenList.show();
    this.button.prop("src", "images/minus.png");
    var obj = this;
    this.button.off("click").click(function(event) { obj.collapse() });
  };
  Object.prototype.collapse = function() {
    // Collapse all children?
    // If selected object is inside, deselect it?
    this.childrenList.hide();
    this.button.prop("src", "images/plus.png");
    var obj = this;
    this.button.off("click").click(function(event) { obj.expand() });
  };

  var Scene = function(name, width, height, backgroundColor) {
    Object.apply(this, [name]);
    this.canvas = $(document.createElement("canvas")).attr("id", "editor-canvas");
    $("#editor-canvas-holder").append(this.canvas);
    this.canvas.css({
      "position": "absolute",
      "left": "50%",
      "top": "50%",
      "margin-left": -width / 2,
      "margin-top": -height / 2,
      "background-color": backgroundColor
    });
    this.canvas.prop({ "width": width, "height": height });
    this.context = this.canvas[0].getContext("2d");
    this.width = { "value": width, "method": "setWidth" };
    this.height = { "value": height, "method": "setHeight" };
    this.backgroundColor = { "value": backgroundColor, "method": "setBackgroundColor" };
  };
  Scene.prototype = new Object();
  Scene.prototype.constructor = Scene;
  Scene.prototype.type = "Scene";
  Scene.prototype.isContainer = true;
  Scene.prototype.setWidth = function(width) {
    this.width.value = width;
    this.canvas.prop({ "width": width });
    this.canvas.css({ "margin-left": -width / 2 });
  };
  Scene.prototype.setHeight = function(height) {
    this.height.value = height;
    this.canvas.prop({ "height": height });
    this.canvas.css({ "margin-top": -height / 2 });
  };
  Scene.prototype.setBackgroundColor = function(backgroundColor) {
    this.backgroundColor.value = backgroundColor;
    this.canvas.css({ "background-color": backgroundColor });
  };

  var Group = function(name) {
    Object.apply(this, [name]);
  };
  Group.prototype = new Object();
  Group.prototype.constructor = Group;
  Group.prototype.type = "Group";
  Group.prototype.isContainer = true;

  var Rect = function(name, backgroundColor, x, y, width, height) {
    Object.apply(this, [name]);
    this.backgroundColor = { "value": backgroundColor };
    this.x = { "value": x };
    this.y = { "value": y };
    this.width = { "value": width };
    this.height = { "value": height };
  };
  Rect.prototype = new Object();
  Rect.prototype.constructor = Rect;
  Rect.prototype.type = "Rect";
  Rect.prototype.isDrawable = true;
  Rect.prototype.draw = function(context) {
    context.fillStyle = this.backgroundColor.value;
    context.fillRect(this.x.value, this.y.value, this.width.value, this.height.value);
  };

  var nextAvailableId = 0;
  var scene = new Scene("myGame", 700, 500, "#eeeeee");
  $("#editor-tree-list").append(scene.listItem);
  var selected = null;

  var draw = function() {
    scene.context.clearRect(0, 0, scene.width.value, scene.height.value);
    for(var i = 0; i < scene.children.length; i++) {
      var object = scene.children[i];
      if(object.isDrawable) {
        object.draw(scene.context);
      }
    }
  };

  var getRandomColor = function() {
    var letters = "0123456789abcdef".split("");
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
  };

  $("#editor-new-button").click(function(event) {
    var type = prompt("What type of object?", "Rect");
    var name = prompt("Object name", "");
    var object;
    if(type == "Rect") {
      var size = 100;
      var color = getRandomColor();
      var x = Math.round(Math.random() * (scene.width.value - size));
      var y = Math.round(Math.random() * (scene.height.value - size));
      object = new Rect(name, color, x, y, size, size);
    } else if(type == "Group") {
      object = new Group(name);
    } else {
      return;
    }
    var parent;
    if(selected === null) {
      parent = scene;
    } else if(selected.isContainer) {
      parent = selected;
    } else {
      parent = selected.parent;
    }
    parent.addChild(object);
    draw();
  });

});
