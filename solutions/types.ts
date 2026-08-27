export abstract class Person {
    abstract firstName: string;
    abstract middleInitial: string;
    abstract lastName: string;
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

    constructor(public firstName: string, public middleInitial: string, public lastName: string) {
        super();
    }
}
