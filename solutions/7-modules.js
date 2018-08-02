"use strict";
exports.__esModule = true;
var types_1 = require("./types");
var user = new types_1.Employee("Alain", "R", "Chautard");
var greet = new types_1.Greeter("Hello " + user.getFullName());
document.body.innerHTML = greet.sayHello();
