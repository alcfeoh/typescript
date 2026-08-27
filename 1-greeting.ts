
function sayHello(person: string) : string {
    return "Hello, " + person;
}

var user = [1, 2, 3];

document.body.innerHTML = sayHello(user);

// Each example is loaded as its own ES module by index.html.
// This marks the file as a module so its names stay in file scope.
export {};
