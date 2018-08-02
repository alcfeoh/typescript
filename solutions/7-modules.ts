import {Employee, Greeter} from './types'

let user = new Employee("Alain", "R", "Chautard");
let greet = new Greeter<string>("Hello "+ user.getFullName());

document.body.innerHTML = greet.sayHello();