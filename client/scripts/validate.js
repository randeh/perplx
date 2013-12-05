"use strict";

(function(exports) {

  exports.isValidName = function(name) {
    return name.length >= 3 && name.length <= 12;
  }

  exports.isValidPassword = function(password) {
    return password.length >= 6 && password.length <= 10;
  }

  exports.isValidEmail = function(email) {
    return true;
  }

}(typeof exports === "undefined" ? this.validate = {} : exports));
