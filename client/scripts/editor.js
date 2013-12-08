"use strict";

// Tasks
// allow formulae as input (except for names)
// dynamic fields
// different shapes and fields
// player, keyboard & mouse objects
// simple user input e.g. mouse control

// next:
//  save non-destructively
//  save object types
//  move object definitions & lists to their own file
//  make saved levels editable & draw shapes on the play screen

// move new-menu css to main.css
// validate object names inputted by user (in the new menu)
// validate input from inspector fields based on their type

// use this["name"] instead of this.name so nothing breaks if the code is ever minified

var openEditor;

$(document).ready(function(event) {

  var objects = {};

  var objectTypes = [ "Box", "Group" ];

  var fields = [
    { name: "name",            display: "Name",             htmlType: "text",   type: "string"  },
    { name: "width",           display: "Width",            htmlType: "number", type: "integer" },
    { name: "height",          display: "Height",           htmlType: "number", type: "integer" },
    { name: "backgroundColor", display: "Background Color", htmlType: "color",  type: "color"   },
    { name: "lineColor",       display: "Line Color",       htmlType: "color",  type: "color"   },
    { name: "x",               display: "X Position",       htmlType: "number", type: "integer" },
    { name: "y",               display: "Y Position",       htmlType: "number", type: "integer" }
  ];

  var nextAvailableId;
  var scene;
  var selected;

  openEditor = function() {
    if(closeCurrentWindow != null) {
      closeCurrentWindow();
    }
    $("#main-container").show();
    $("#editor-pane").show();
    nextAvailableId = 0;
    scene = new objects.Scene("Game");
    selected = null;
    closeCurrentWindow = closeEditor;
  };

  var closeEditor = function() {
    $("#main-container").hide();
    $("#editor-pane").hide();
    $("#editor-canvas-holder").empty();
    $("#editor-tree-list").empty();
    $("#editor-properties").empty();
    nextAvailableId = 0;
    scene = null;
    selected = null;
    closeCurrentWindow = null;
  };

  objects.Object = function(name) {
    if(arguments.length == 0) {
      return;
    }
    this.id = nextAvailableId++;
    this.name = { "value": name, "method": "setName" };
    this.label = $(document.createElement("span")).text(this.name.value + " : " + this.type);
    var obj = this;
    this.label.click(function(event) { obj.select() });
    this.listItem = $(document.createElement("li")).append(this.label);
    if(this.isContainer) {
      this.children = [];
      this.button = $(document.createElement("img")).prop("src", "images/plus.png");
      this.childrenList = $(document.createElement("ol")).addClass("tree").hide();
      this.button.click(function(event) { obj.expand() });
      this.listItem.prepend(this.button).append(this.childrenList);
    }
  };
  objects.Object.prototype.isContainer = false;
  objects.Object.prototype.setName = function(name) {
    this.name.value = name;
    this.label.text(this.name.value + " : " + this.type);
  };
  objects.Object.prototype.addChild = function(child) {
    this.children.push(child);
    this.childrenList.append(child.listItem);
    child.parent = this;
  };
  objects.Object.prototype.select = function() {
    if(selected != null) {
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
  objects.Object.prototype.deselect = function() {
    selected = null;
    this.label.removeClass("selected");
    $("#editor-properties").empty();
    var obj = this;
    this.label.off("click").click(function(event) { obj.select() });
  };
  objects.Object.prototype.inspect = function() {
    var obj = this;
    for(var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if(this[field.name] != undefined) {
        var id = field.name + this.id;
        var label = $(document.createElement("label")).prop("for", id).text(field.display + ":");
        var input = $(document.createElement("input")).prop({ "id": id, "type": field.htmlType, "value": this[field.name].value });
        input.on("input", { field: field, input: input }, function(event) {
          var field = event.data.field;
          var input = event.data.input;
          if(obj[field.name].method != undefined) {
            obj[obj[field.name].method](input.val());
          } else {
            obj[field.name].value = input.val();
          }
          if(field.name != "name") {
            scene.draw();
          }
        });
        var container = $(document.createElement("div")).append(label).append(input);
        $("#editor-properties").append(container);
      }
    }
  };
  objects.Object.prototype.expand = function() {
    this.childrenList.show();
    this.button.prop("src", "images/minus.png");
    var obj = this;
    this.button.off("click").click(function(event) { obj.collapse() });
  };
  objects.Object.prototype.collapse = function() {
    for(var i = 0; i < this.children.length; i++) {
      var child = this.children[i];
      if(child == selected) {
        child.deselect();
      }
      if(child.isContainer) {
        child.collapse();
      }
    }
    this.childrenList.hide();
    this.button.prop("src", "images/plus.png");
    var obj = this;
    this.button.off("click").click(function(event) { obj.expand() });
  };

  objects.Scene = function(name, width, height, backgroundColor) {
    objects.Object.apply(this, [name]);
    if(width == undefined) {
      width = 700;
    }
    if(height == undefined) {
      height = 500;
    }
    if(backgroundColor == undefined) {
      backgroundColor = "#eeeeee";
    }
    $("#editor-tree-list").append(this.listItem);
    this.canvas = $(document.createElement("canvas"));
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
  objects.Scene.prototype = new objects.Object();
  objects.Scene.prototype.constructor = objects.Scene;
  objects.Scene.prototype.type = "Scene";
  objects.Scene.prototype.isContainer = true;
  objects.Scene.prototype.draw = function() {
    this.context.clearRect(0, 0, this.width.value, this.height.value);
    for(var i = 0; i < this.children.length; i++) {
      this.children[i].draw(this.context);
    }
  };
  objects.Scene.prototype.setWidth = function(width) {
    this.width.value = width;
    this.canvas.prop({ "width": width });
    this.canvas.css({ "margin-left": -width / 2 });
  };
  objects.Scene.prototype.setHeight = function(height) {
    this.height.value = height;
    this.canvas.prop({ "height": height });
    this.canvas.css({ "margin-top": -height / 2 });
  };
  objects.Scene.prototype.setBackgroundColor = function(backgroundColor) {
    this.backgroundColor.value = backgroundColor;
    this.canvas.css({ "background-color": backgroundColor });
  };

  objects.Group = function(name) {
    objects.Object.apply(this, [name]);
  };
  objects.Group.prototype = new objects.Object();
  objects.Group.prototype.constructor = objects.Group;
  objects.Group.prototype.type = "Group";
  objects.Group.prototype.isContainer = true;
  objects.Group.prototype.draw = function(context) {
    for(var i = 0; i < this.children.length; i++) {
      this.children[i].draw(context);
    }
  };

  objects.Box = function(name, backgroundColor, x, y, width, height) {
    objects.Object.apply(this, [name]);
    if (backgroundColor == undefined) {
      backgroundColor = "#000000";
    }
    if (x == undefined) {
      x = 0;
    }
    if (y == undefined) {
      y = 0;
    }
    if (width == undefined) {
      width = 100;
    }
    if (height == undefined) {
      height = 100;
    }
    this.backgroundColor = { "value": backgroundColor };
    this.x = { "value": x };
    this.y = { "value": y };
    this.width = { "value": width };
    this.height = { "value": height };
  };
  objects.Box.prototype = new objects.Object();
  objects.Box.prototype.constructor = objects.Box;
  objects.Box.prototype.type = "Box";
  objects.Box.prototype.draw = function(context) {
    context.fillStyle = this.backgroundColor.value;
    context.fillRect(this.x.value, this.y.value, this.width.value, this.height.value);
  };

  var openNewMenu = function() {
    for(var i = 0; i < objectTypes.length; i++) {
      var type = objectTypes[i];
      var option = $(document.createElement("option")).val(type).text(type);
      $("#editor-new-type").append(option);
    }
    $("#editor-new-menu").show();
    $("#editor-new-name").focus();
  };

  var closeNewMenu = function() {
    $("#editor-new-type").empty();
    $(".editor-new-field").val("");
    $("#editor-new-menu").hide();
  };

  var newObject = function() {
    var name = $("#editor-new-name").val();
    // TODO Validate name (make a new function in validate.js)
    var type = $("#editor-new-type").val();
    closeNewMenu();
    var object = null;
    for(var i = 0; i < objectTypes.length; i++) {
      if(objectTypes[i] == type) {
        object = new objects[type](name);
        break;
      }
    }
    if(object == null) {
      return;
    }
    var parent;
    if(selected == null) {
      parent = scene;
    } else if(selected.isContainer) {
      parent = selected;
    } else {
      parent = selected.parent;
    }
    parent.addChild(object);
    parent.expand();
    object.select();
    scene.draw();
  };

  $("#editor-new-button").click(openNewMenu);
  $("#editor-new-cancel").click(closeNewMenu);
  $("#editor-new-ok").click(newObject);
  $(".editor-new-field").keypress(function(event) {
    if(event.which == 13) {
      newObject();
    }
  });

  // TODO If a group is deleted, there will be circular references between .children and .parent possibly preventing garbage collection
  $("#editor-delete-button").click(function(event) {
    if(selected != null && selected.type != objects.Scene.prototype.type) {
      var object = selected;
      object.deselect();
      object.parent.children = jQuery.grep(object.parent.children, function(arrayItem) {
        return arrayItem != object;
      });
      object.listItem.empty().remove();
      scene.draw();
    }
  });

  var stripUnwantedFields = function(object) {
    delete object.label;
    delete object.listItem;
    delete object.button;
    delete object.childrenList;
    delete object.canvas;
    delete object.context;
    delete object.parent;
    if(object.isContainer) {
      for(var i = 0; i < object.children.length; i++) {
        stripUnwantedFields(object.children[i]);
      }
    }
  };

  $("#editor-save-button").click(function(event) {
    stripUnwantedFields(scene);
    // also strip "method" fields?
    var data = {
      "name": scene.name.value,
      "level": scene
    };
    messageServer("saveLevel", data);
    // ideally the save button shouldn't destroy 'scene' and exit the editor but that's okay for now
    openLoading();
  });

  callbacks.levelSaved = function(data) {
    openLobby();
  };

  $("#editor-exit-button").click(function(event) {
    openLobby();
  });

});
