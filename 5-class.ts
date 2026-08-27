interface Person {
    firstName: string,
    lastName: string,
    getFullName() : string
}

class Employee implements Person {
    fullName: string;
    constructor(public firstName: string, public middleInitial: string, public lastName: string) {
        this.fullName = firstName + " " + middleInitial + " " + lastName;
    }

    getFullName() : string {
        return this.fullName;
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
