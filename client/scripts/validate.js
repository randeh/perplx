"use strict";

(function(exports) {

  exports.isValidName = function(name) {
    return true;
  }

  exports.isValidPassword = function(password) {
    return true;
  }

  exports.isValidEmail = function(email) {
    return true;
  }

}(typeof exports === "undefined" ? this.validate = {} : exports));
