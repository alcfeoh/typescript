
function sayHello(person) {
    return "Hello, " + person;
}

var user = "World";

document.body.innerHTML = sayHello(user);

// Each example is loaded as its own ES module by index.html.
// This marks the file as a module so its names stay in file scope.
export {};
