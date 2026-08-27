abstract class Person {
    abstract firstName: string;
    abstract middleInitial: string;
    abstract lastName: string;
    getFullName() : string {
        return this.firstName + " " + this.middleInitial + " " + this.lastName;
    }
}

class Employee extends Person {

    constructor(public firstName: string, public middleInitial: string, public lastName: string) {
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

document.body.innerHTML = sayHello(user);

// Each example is loaded as its own ES module by index.html.
// This marks the file as a module so its names stay in file scope.
export {};
