abstract class Person {
    firstName: string;
    middleInitial: string;
    lastName: string;
    getFullName() : string {
        return ` ${this.firstName} ${this.middleInitial} ${this.lastName}`;
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
}


let user = new Employee("Alain", "R", "Chautard");

let msg = `<pre>Hello,
${user.getFullName()}</pre>`;

let greet = new Greeter<string>(msg);

document.body.innerHTML = greet.sayHello();