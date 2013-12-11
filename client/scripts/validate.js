"use strict";

(function(exports) {

  var nameRegex = /^[A-Z]{3,12}$/i;
  var passwordRegex = /^[A-Z0-9!$%&*@#~?.,]{6,15}$/i;
  var emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  var objectNameRegex = /^[A-Z0-9]{1,15}$/i;

  exports.isValidName = function(name) {
    return nameRegex.test(name);
  };

  exports.isValidPassword = function(password) {
    return passwordRegex.test(password);
  };

  exports.isValidEmail = function(email) {
    return emailRegex.test(email);
  };

  exports.isValidObjectName = function(name) {
    return objectNameRegex.test(name);
  };

}(typeof exports === "undefined" ? this.validate = {} : exports));
