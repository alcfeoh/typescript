interface Person {
    firstName: string,
    lastName: string
}

class Employee {
    fullName: string;
    constructor(public firstName, public middleInitial, public lastName) {
        this.fullName = firstName + " " + middleInitial + " " + lastName;
    }
}

function sayHello(person: Person) : string {
    return "Hello, " + person.firstName + " " + person.lastName;
}

let user = new Employee("Alain", "R", "Chautard");

document.body.innerHTML = sayHello(user);
