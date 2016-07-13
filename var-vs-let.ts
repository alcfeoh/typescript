
{
    var x = 10;
    console.log("x inner scope: " + x); // Displays 10
}
console.log("x outer scope: " + x); // Displays 10

{
    let y = 20;
    console.log("y inner scope: ", y); // Displays 20
}
console.log("y outer scope: ", y); // TypeScript compile error

{
    const z = 20;
    z = 50; // Error, a constant cannot be reassigned
}



interface Person {
    firstName: string;
    lastName: string;
}