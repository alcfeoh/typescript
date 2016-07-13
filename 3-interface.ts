interface Person {
    firstName: string,
    lastName: string
}

function sayHello(person: Person) : string {
    return "Hello, " + person.firstName + " " + person.lastName;
}

let user = {firstName: "John", lastName: "Doe"};

document.body.innerHTML = sayHello(user);
