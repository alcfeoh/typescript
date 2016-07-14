abstract class Person {
    firstName: string;
    middleInitial: string;
    lastName: string;
    getFullName() : string {
        return this.firstName + " " + this.middleInitial + " " + this.lastName;
    }
}

class Employee extends Person {

    constructor(public firstName, public middleInitial, public lastName) {
        super();
    }
}

function sayHello(person: Person) : string {
    return "Hello, " + person.getFullName();
}

let user = new Employee("Alain", "R", "Chautard");

document.body.innerHTML = sayHello(user);