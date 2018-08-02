"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var Person = (function () {
    function Person() {
    }
    Person.prototype.getFullName = function () {
        return this.firstName + " " + this.middleInitial + " " + this.lastName;
    };
    return Person;
}());
exports.Person = Person;
var Greeter = (function () {
    function Greeter(message) {
        this.greeting = message;
    }
    Greeter.prototype.sayHello = function () {
        return this.greeting;
    };
    return Greeter;
}());
exports.Greeter = Greeter;
var Employee = (function (_super) {
    __extends(Employee, _super);
    function Employee(firstName, middleInitial, lastName) {
        var _this = _super.call(this) || this;
        _this.firstName = firstName;
        _this.middleInitial = middleInitial;
        _this.lastName = lastName;
        return _this;
    }
    return Employee;
}(Person));
exports.Employee = Employee;
