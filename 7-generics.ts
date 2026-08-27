abstract class Person {
    abstract firstName: string;
    abstract middleInitial: string;
    abstract lastName: string;
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

    constructor(public firstName: string, public middleInitial: string, public lastName: string) {
        super();
    }
}

let user = new Employee("Alain", "R", "Chautard");
let greet = new Greeter<string>("Hello "+ user.getFullName());

document.body.innerHTML = greet.sayHello();

// Each example is loaded as its own ES module by index.html.
// This marks the file as a module so its names stay in file scope.
export {};
