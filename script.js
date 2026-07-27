function calculate(){

let a2 = Number(a2.value) * Number(a2price.value);
let a3 = Number(document.getElementById("a3").value) *
Number(document.getElementById("a3price").value);


let p2 = Number(document.getElementById("p2").value) *
Number(document.getElementById("p2price").value);

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
