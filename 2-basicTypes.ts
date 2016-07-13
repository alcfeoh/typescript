enum Name {"John", "Jessica", "Ron", "Lisa"};

for (var i = 0;  i <= 3; i++){
    document.body.innerHTML += sayHello(Name[i]) + " <br> ";
}

function sayHello(person : string) {
    return "Hello, " + person;
}

