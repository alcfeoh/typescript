export abstract class Person {
    firstName: string;
    middleInitial: string;
    lastName: string;
    getFullName() : string {
        return this.firstName + " " + this.middleInitial + " " + this.lastName;
    }
}

export class Greeter<T> {
    greeting: T;
    constructor(message: T) {
        this.greeting = message;
    }
    sayHello() : T {
        return this.greeting;
    }
}

export class Employee extends Person {

    constructor(public firstName, public middleInitial, public lastName) {
        super();
    }
}
