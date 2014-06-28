"use strict";

var objects = {};

var objectTypes = [ "Box", "Group", "Player" ];

var fields = {
  "name":                  { displayName: "Name",             method: "setName",            defaultValue: "",        type: "name"                   },
  "canvasWidth":           { displayName: "Width",            method: "setWidth",           defaultValue: 700,       type: "integer"                },
  "canvasHeight":          { displayName: "Height",           method: "setHeight",          defaultValue: 500,       type: "integer"                },
  "canvasBackgroundColor": { displayName: "Background Color", method: "setBackgroundColor", defaultValue: "#eeeeee", type: "color"                  },
  "canvasBorderColor":     { displayName: "Border Color",     method: "setBorderColor",     defaultValue: "#000000", type: "color"                  },
  "shapeWidth":            { displayName: "Width",                                          defaultValue: 100,       type: "integer"                },
  "shapeHeight":           { displayName: "Height",                                         defaultValue: 100,       type: "integer"                },
  "shapeBackgroundColor":  { displayName: "Background Color",                               defaultValue: "#ff9933", type: "color"                  },
  "shapeLineColor":        { displayName: "Line Color",                                     defaultValue: "#ffffff", type: "color"                  },
  "x":                     { displayName: "X Position",                                     defaultValue: 0,         type: "integer"                },
  "y":                     { displayName: "Y Position",                                     defaultValue: 0,         type: "integer"                },
  "mouseX":                { displayName: "X Position",                                                              type: "integer", dynamic: true },
  "mouseY":                { displayName: "Y Position",                                                              type: "integer", dynamic: true },
  "mouseClick":            { displayName: "Click",                                                                   type: "boolean", dynamic: true },
  "keyArrowUp":            { displayName: "Arrow Up",                                                                type: "boolean", dynamic: true },
  "keyArrowDown":          { displayName: "Arrow Down",                                                              type: "boolean", dynamic: true },
  "keyArrowLeft":          { displayName: "Arrow Left",                                                              type: "boolean", dynamic: true },
  "keyArrowRight":         { displayName: "Arrow Right",                                                             type: "boolean", dynamic: true },
  "keySpace":              { displayName: "Space",                                                                   type: "boolean", dynamic: true }
};

var fieldTypes = {
  "name":    { htmlType: "text",     validator: validate.isValidObjectName                                                  },
  "string":  { htmlType: "text",     validator: validate.isValidString,    formulaValidator: validate.isValidStringFormula  },
  "integer": { htmlType: "number",   validator: validate.isValidInteger,   formulaValidator: validate.isValidIntegerFormula },
  "color":   { htmlType: "color",    validator: validate.isValidColor,     formulaValidator: validate.isValidColorFormula   },
  "boolean": { htmlType: "checkbox", validator: validate.isValidBoolean,   formulaValidator: validate.isValidBooleanFormula }
};

var buildLevel;

$(document).ready(function(event) {

  objects.Object = function(properties) {
    if(arguments.length == 0) {
      return;
    }
    this.properties = {};
    for(var i = 0; i < this.fields.length; i++) {
      var field = this.fields[i];
      if(field in properties) {
        // TODO need to validate this?
        // (only for sanity, any validation failure would be a bug)
        this.properties[field] = properties[field];
      } else if("defaultValue" in fields[field]) {
        this.properties[field] = { value: fields[field].defaultValue };
      } else if(!("dynamic" in fields[field])) {
        callbacks.displayError({ message: "Required field '" + field + "' not supplied in " + this.type + " constructor" });
      }
    }
    if(mode == "editor") {
      this.label = $(document.createElement("span"));
      this.label.click(this, function(event) { event.data.select() });
      this.listItem = $(document.createElement("li")).append(this.label);
    }
    if(this.isContainer) {
      this.children = [];
      if(mode == "editor") {
        this.button = $(document.createElement("img")).prop("src", "images/plus.png");
        this.childrenList = $(document.createElement("ol")).addClass("tree").hide();
        this.button.click(this, function(event) { event.data.expand() });
        this.listItem.prepend(this.button).append(this.childrenList);
      }
    }
  };
  objects.Object.prototype.fields = [ "name" ];
  objects.Object.prototype.isContainer = false;
  objects.Object.prototype.applyUpdateMethods = function() {
    for(var field in this.properties) {
      if("method" in fields[field]) {
        this[fields[field].method](this.properties[field].value);
      }
    }
  };
  objects.Object.prototype.setName = function(name, previousName) {
    if(mode == "editor") {
      if(name != "") {
        this.label.text(name + " : " + this.type);
      } else {
        this.label.text("<object> : " + this.type);
      }
      if(previousName !== undefined && previousName != "") {
        delete usedNames[previousName];
      }
      if(name != "") {
        usedNames[name] = true;
      }
    }
  };
  objects.Object.prototype.addChild = function(child) {
    this.children.push(child);
    child.parent = this;
    if(mode == "editor") {
      this.childrenList.append(child.listItem);
    }
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
    this.label.off("click").click(this, function(event) { event.data.deselect() });
  };
  objects.Object.prototype.deselect = function() {
    selected = null;
    this.label.removeClass("selected");
    $("#editor-properties").empty();
    this.label.off("click").click(this, function(event) { event.data.select() });
  };
  objects.Object.prototype.inspect = function() {
    for(var i = 0; i < this.fields.length; i++) {
      var field = this.fields[i];
      var fieldProperties = fields[field];
      var id = "inspector-field-" + field;
      var label = $(document.createElement("label")).prop("for", id).text(fieldProperties.displayName + ":");
      var container = $(document.createElement("div")).append(label);
      if("dynamic" in fieldProperties) {
        var dynamic = $(document.createElement("span")).text(field);
        container.append(dynamic);
      } else {
        var input = $(document.createElement("input")).prop({ "id": id, "type": fieldTypes[fieldProperties.type].htmlType });
        input.val(this.properties[field].value).data("lastValue", this.properties[field].value);
        input.on("input", { obj: this, field: field, fieldProperties: fieldProperties, input: input }, function(event) {
          var obj = event.data.obj;
          var field = event.data.field;
          var fieldProperties = event.data.fieldProperties;
          var input = event.data.input;
          var val = input.val();
          var lastValue = input.data("lastValue");
          if(fieldTypes[fieldProperties.type].validator(val)) {
            input.data("lastValue", val);
            obj.properties[field].value = val;
            if("method" in fieldProperties) {
              obj[fieldProperties.method](val, lastValue);
            }
            if(field != "name") {
              scene.draw();
            }
          }
        }).blur({ fieldProperties: fieldProperties, input: input }, function(event) {
          var fieldProperties = event.data.fieldProperties;
          var input = event.data.input;
          if(!fieldTypes[fieldProperties.type].validator(input.val())) {
            input.val(input.data("lastValue")).trigger("input");
          }
        });
        container.append(input);
      }
      $("#editor-properties").append(container);
    }
  };
  objects.Object.prototype.expand = function() {
    this.childrenList.show();
    this.button.prop("src", "images/minus.png");
    this.button.off("click").click(this, function(event) { event.data.collapse() });
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
    this.button.off("click").click(this, function(event) { event.data.expand() });
  };

  objects.Scene = function(properties) {
    objects.Object.apply(this, [properties]);
    this.canvas = $(document.createElement("canvas"));
    this.canvas.css({
      "position": "absolute",
      "left": "50%",
      "top": "50%"
    });
    this.context = this.canvas[0].getContext("2d");
    this.applyUpdateMethods();
  };
  objects.Scene.prototype = new objects.Object();
  objects.Scene.prototype.constructor = objects.Scene;
  objects.Scene.prototype.type = "Scene";
  objects.Scene.prototype.fields = [ "name", "canvasWidth", "canvasHeight", "canvasBackgroundColor", "canvasBorderColor" ];
  objects.Scene.prototype.isContainer = true;
  objects.Scene.prototype.draw = function() {
    this.context.clearRect(0, 0, this.properties.canvasWidth.value, this.properties.canvasHeight.value);
    for(var i = 0; i < this.children.length; i++) {
      this.children[i].draw(this.context);
    }
  };
  objects.Scene.prototype.setWidth = function(width) {
    this.canvas.prop({ "width": width });
    this.canvas.css({ "margin-left": -width / 2 });
  };
  objects.Scene.prototype.setHeight = function(height) {
    this.canvas.prop({ "height": height });
    this.canvas.css({ "margin-top": -height / 2 });
  };
  objects.Scene.prototype.setBackgroundColor = function(backgroundColor) {
    this.canvas.css({ "background-color": backgroundColor });
  };
  objects.Scene.prototype.setBorderColor = function(borderColor) {
    this.canvas.css({ "border-style": "solid", "border-width": "1px", "border-color": borderColor });
  };

  objects.Group = function(properties) {
    objects.Object.apply(this, [properties]);
    this.applyUpdateMethods();
  };
  objects.Group.prototype = new objects.Object();
  objects.Group.prototype.constructor = objects.Group;
  objects.Group.prototype.type = "Group";
  objects.Group.prototype.fields = [ "name" ];
  objects.Group.prototype.isContainer = true;
  objects.Group.prototype.draw = function(context) {
    for(var i = 0; i < this.children.length; i++) {
      this.children[i].draw(context);
    }
  };

  objects.Box = function(properties) {
    objects.Object.apply(this, [properties]);
    this.applyUpdateMethods();
  };
  objects.Box.prototype = new objects.Object();
  objects.Box.prototype.constructor = objects.Box;
  objects.Box.prototype.type = "Box";
  objects.Box.prototype.fields = [ "name", "shapeWidth", "shapeHeight", "shapeBackgroundColor", "shapeLineColor", "x", "y" ];
  objects.Box.prototype.draw = function(context) {
    context.rect(this.properties.x.value, this.properties.y.value, this.properties.shapeWidth.value, this.properties.shapeHeight.value);
    context.fillStyle = this.properties.shapeBackgroundColor.value;
    context.fill();
    context.strokeStyle = this.properties.shapeLineColor.value;
    context.lineWidth = 1;
    context.stroke();
  };

  objects.Player = function(properties) {
    objects.Object.apply(this, [properties]);
    this.applyUpdateMethods();
    this.keyboard = new objects.Keyboard();
    this.mouse = new objects.Mouse();
    this.addChild(this.keyboard);
    this.addChild(this.mouse);
    this.expand();
  };
  objects.Player.prototype = new objects.Object();
  objects.Player.prototype.constructor = objects.Player;
  objects.Player.prototype.type = "Player";
  objects.Player.prototype.fields = [ "name" ];
  objects.Player.prototype.isContainer = true;
  objects.Player.prototype.draw = function(context) {};

  objects.Mouse = function(properties) {
    objects.Object.apply(this, [properties]);
    this.applyUpdateMethods();
  };
  objects.Mouse.prototype = new objects.Object();
  objects.Mouse.prototype.constructor = objects.Mouse;
  objects.Mouse.prototype.type = "Mouse";
  objects.Mouse.prototype.fields = [ "name", "mouseX", "mouseY", "mouseClick" ];
  objects.Mouse.prototype.draw = function(context) {};

  objects.Keyboard = function(properties) {
    objects.Object.apply(this, [properties]);
    this.applyUpdateMethods();
  };
  objects.Keyboard.prototype = new objects.Object();
  objects.Keyboard.prototype.constructor = objects.Keyboard;
  objects.Keyboard.prototype.type = "Keyboard";
  objects.Keyboard.prototype.fields = [ "name", "keyArrowUp", "keyArrowDown", "keyArrowLeft", "keyArrowRight", "keySpace" ];
  objects.Keyboard.prototype.draw = function(context) {};

  buildLevel = function(data) {
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
