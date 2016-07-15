abstract class Person {
    firstName: string;
    middleInitial: string;
    lastName: string;
    getFullName() : string {
        return this.firstName + " " + this.middleInitial + " " + this.lastName;
    }
}

class Greeter<T> {
    greeting: T;
    constructor(message: T) {
        this.greeting = message;
    }
    sayHello() : T {
        return this.greeting;
    }
}

class Employee extends Person {

    constructor(public firstName, public middleInitial, public lastName) {
        super();
    }
    getFullName() : string {
        return this.firstName + " " + this.lastName;
    }
}

function sayHello(person: Person) : string {
    return "Hello, " + person.getFullName();
}

let user = new Employee("Alain", "R", "Chautard");
let greet = new Greeter<string>(user.getFullName());

document.body.innerHTML = greet.sayHello();