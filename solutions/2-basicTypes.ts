const names = ["John", "Jessica", "Ron", "Lisa"];

for (let name of names){
    document.body.innerHTML += sayHello(name) + " <br> ";
}

function sayHello(person : string) {
    return "Hello, " + person;
}

// Each example is loaded as its own ES module by index.html.
// This marks the file as a module so its names stay in file scope.
export {};
