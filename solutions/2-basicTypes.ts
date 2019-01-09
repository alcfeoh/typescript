const names = ["John", "Jessica", "Ron", "Lisa"];

for (let name of names){
    document.body.innerHTML += sayHello(name) + " <br> ";
}

function sayHello(person : string) {
    return "Hello, " + person;
}

