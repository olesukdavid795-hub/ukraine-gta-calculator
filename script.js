function calculate(){

let a2price = 900;

let a2 = Number(document.getElementById("a2").value) * a2price;


let a3price = Number(document.getElementById("a3price").value);

if(a3price > 1200){
    a3price = 1200;
}

let a3 = Number(document.getElementById("a3").value) * a3price;


let p2price = Number(document.getElementById("p2price").value);

if(p2price > 800){
    p2price = 800;
}

let p2 = Number(document.getElementById("p2").value) * p2price;


let p3price = Number(document.getElementById("p3price").value);

if(p3price > 1100){
    p3price = 1100;
}

let p3 = Number(document.getElementById("p3").value) * p3price;


let total = a2 + a3 + p2 + p3;


document.getElementById("result").innerHTML =
`
🍾 Алкоголь: ${a2+a3} грн <br>
🌿 Петрушка: ${p2+p3} грн <br><br>
🔥 Всього: ${total} грн
`;

}
