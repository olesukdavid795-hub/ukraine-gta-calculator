function calculate() {

let alcohol =
(Number(document.getElementById("a2").value) * 900) +
(Number(document.getElementById("a3").value) * 1200);


let petrushka =
(Number(document.getElementById("p2").value) * 800) +
(Number(document.getElementById("p3").value) * 1100);


let total = alcohol + petrushka;


document.getElementById("result").innerHTML =
`
🍾 Алкоголь: ${alcohol} грн <br>
🌿 Петрушка: ${petrushka} грн <br><br>

🔥 Всього: ${total} грн
`;

}
