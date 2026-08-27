interface Person {
    firstName: string,
    lastName: string
}

function sayHello(person: Person) : string {
    return "Hello, " + person.firstName + " " + person.lastName;
}

let user = {firstName: "John", lastName: "Doe"};

document.body.innerHTML = sayHello(user);

// Each example is loaded as its own ES module by index.html.
// This marks the file as a module so its names stay in file scope.
export {};
