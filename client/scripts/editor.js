"use strict";

// Tasks:

// allow formulae as input (except for names)
// dynamic fields & triggers
// more shapes and fields
// player, keyboard & mouse objects
// simple user input e.g. mouse control
// publishing/testing levels
// don't allow duplicate object names
// avoid using .css(), use classes instead

// build script
// > minify scripts
// > combine files
// > use object["property"] instead of object.property so nothing breaks when the code is minified
// http server for client
// > possibly use python's SimpleHTTPServer
// > remove "http:" protocol specifier from jQuery source

var selected;

$(document).ready(function(event) {

  var openEditor = function() {
    if(closeCurrentWindow != null) {
      closeCurrentWindow();
    }
    $("#main-container").show();
    $("#editor-pane").show();
    mode = "editor";
    selected = null;
    closeCurrentWindow = closeEditor;
  };

  var closeEditor = function() {
    $("#main-container").hide();
    $("#editor-pane").hide();
    $("#editor-canvas-holder").empty();
    $("#editor-tree-list").empty();
    $("#editor-properties").empty();
    mode = "";
    scene = null;
    selected = null;
    closeCurrentWindow = null;
  };

  callbacks.openEditor = function(data) {
    openEditor();
    scene = new objects.Scene({ name: { value: "Game" } });
    $("#editor-tree-list").append(scene.listItem);
    $("#editor-canvas-holder").append(scene.canvas);
  };

  callbacks.editLevel = function(data) {
    openEditor();
    scene = buildLevel(JSON.parse(data));
    $("#editor-tree-list").append(scene.listItem);
    $("#editor-canvas-holder").append(scene.canvas);
    scene.draw();
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
    if(!fieldTypes.name.validator(name)) {
      // TEMP
      alert("Invalid object name");
      return;
    }
    var type = $("#editor-new-type").val();
    closeNewMenu();
    var object = null;
    for(var i = 0; i < objectTypes.length; i++) {
      if(objectTypes[i] == type) {
        object = new objects[type]({ name: { value: name } });
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

  var copyObject = function(object) {
    var copy = {};
    copy.type = object.type;
    copy.properties = object.properties;
    if(object.isContainer) {
      copy.children = new Array();
      for(var i = 0; i < object.children.length; i++) {
        copy.children.push(copyObject(object.children[i]));
      }
    }
    return copy;
  };

  $("#editor-save-button").click(function(event) {
    var sceneCopy = copyObject(scene);
    var data = {
      "name": scene.properties.name.value,
      "players": 1,
      "level": sceneCopy
    };
    messageServer("saveLevel", data);
  });

  callbacks.levelSaved = function(data) {
    // TEMP
    alert("Level saved.");
  };

  callbacks.levelNotSaved = function(data) {
    // TEMP
    alert(data.message);
  };

  $("#editor-exit-button").click(function(event) {
    messageServer("exitEditor", {});
    openMainLoading();
  });

});
