interface Person {
    firstName: string,
    lastName: string,
    getFullName() : string
}

class Employee implements Person {
    fullName: string;
    constructor(public firstName, public middleInitial, public lastName) {
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


class Grid {
    static origin = {x: 0, y: 0};
    calculateDistanceFromOrigin(point: {x: number; y: number;}) {
        let xDist = (point.x - Grid.origin.x);
        let yDist = (point.y - Grid.origin.y);
        return Math.sqrt(xDist * xDist + yDist * yDist) / this.scale;
    }
    constructor (public scale: number) { }
}
