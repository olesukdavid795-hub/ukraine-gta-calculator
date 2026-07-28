// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


const firebaseConfig = {
  apiKey: "AIzaSyB-rv0vO2ZN_BYhraPNBIKhvTahrtEB9D8",
  authDomain: "revenant-v2-955dc.firebaseapp.com",
  databaseURL: "https://revenant-v2-955dc-default-rtdb.firebaseio.com",
  projectId: "revenant-v2-955dc",
  storageBucket: "revenant-v2-955dc.firebasestorage.app",
  messagingSenderId: "888954510701",
  appId: "1:888954510701:web:84dc99929d5b82ee564e64"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
let prices = {

    alcohol2:900,
    alcohol3:1200,
    parsley2:800,
    parsley3:1100

};



let players = JSON.parse(
    localStorage.getItem("revenant_players")
) || [];



let history = JSON.parse(
    localStorage.getItem("revenant_history")
) || [];





// ==========================
// РОЗРАХУНОК
// ==========================


function calculate(){


    let a2 = Number(
        document.getElementById("alcohol2").value
    ) || 0;


    let a3 = Number(
        document.getElementById("alcohol3").value
    ) || 0;


    let p2 = Number(
        document.getElementById("parsley2").value
    ) || 0;


    let p3 = Number(
        document.getElementById("parsley3").value
    ) || 0;



    let total =

        a2 * prices.alcohol2 +

        a3 * prices.alcohol3 +

        p2 * prices.parsley2 +

        p3 * prices.parsley3;



    document.getElementById("total").innerHTML =

    total.toLocaleString("uk-UA") + " грн";



    return total;

}







document.addEventListener(
"input",
calculate
);







// ==========================
// ЗБЕРЕЖЕННЯ ЗДАЧІ
// ==========================


document
.getElementById("saveSalary")
.onclick = ()=>{


let name =

document.getElementById("playerName")
.value.trim();



if(!name){

showToast("Введіть нік гравця");

return;

}



let total = calculate();



let products =

Number(document.getElementById("alcohol2").value || 0)

+

Number(document.getElementById("alcohol3").value || 0)

+

Number(document.getElementById("parsley2").value || 0)

+

Number(document.getElementById("parsley3").value || 0);





let player = players.find(
p=>p.name===name
);




if(!player){


player={

name:name,

salary:0,

products:0,

deliveries:0

};


players.push(player);


}





player.salary += total;

player.products += products;

player.deliveries++;






history.unshift({

name:name,

salary:total,

products:products,

date:new Date()
.toLocaleString("uk-UA")

});





saveData();



render();



clearForm();



showToast(
"Здача збережена"
);



};








// ==========================
// ЗБЕРЕЖЕННЯ
// ==========================


function saveData(){


localStorage.setItem(

"revenant_players",

JSON.stringify(players)

);



localStorage.setItem(

"revenant_history",

JSON.stringify(history)

);


}








// ==========================
// ТОП
// ==========================


function renderTop(){


let box =
document.getElementById(
"topPlayers"
);


let top = [...players]

.sort(
(a,b)=>b.salary-a.salary
)

.slice(0,3);



box.innerHTML="";



top.forEach(
(p,i)=>{


box.innerHTML += `

<div class="item">

${i+1} місце 🏆

<br>

<b>${p.name}</b>

<br>

💰 ${p.salary.toLocaleString("uk-UA")} грн

<br>

📦 ${p.products} шт продукції

</div>

`;


});



}







// ==========================
// ІСТОРІЯ
// ==========================


function renderHistory(){


let box =
document.getElementById(
"history"
);



box.innerHTML="";



history.slice(0,20)
.forEach(h=>{


box.innerHTML += `

<div class="item">

<b>${h.name}</b>

<br>

📦 ${h.products} шт

<br>

💰 ${h.salary.toLocaleString("uk-UA")} грн

<br>

🕒 ${h.date}

</div>

`;



});


}







// ==========================
// СТАТИСТИКА
// ==========================


function renderStats(){


let box =
document.getElementById(
"statistics"
);



box.innerHTML="";



players.forEach(p=>{


box.innerHTML +=`

<div class="item">

👤 ${p.name}

<br>

💰 ${p.salary.toLocaleString("uk-UA")} грн

<br>

📦 ${p.products} шт

<br>

📈 ${p.deliveries} здач

</div>

`;



});


}







// ==========================
// ВЛАСНИК
// ==========================


document
.getElementById("ownerLogin")
.onclick=()=>{


let pass =
document.getElementById(
"ownerPassword"
).value;



if(pass==="admin"){


document
.getElementById(
"ownerPanel"
)
.classList.remove("hidden");


showToast(
"Доступ власника відкрито"
);


}

else{


showToast(
"Невірний пароль"
);


}


};








// ==========================
// ПОШУК ГРАВЦЯ
// ==========================


document
.getElementById("searchPlayer")
.oninput=function(){


let p =
players.find(

x=>x.name
.toLowerCase()
===
this.value
.toLowerCase()

);



let box =
document.getElementById(
"playerProfile"
);



if(!p){

box.innerHTML=
"Гравця не знайдено";

return;

}



box.innerHTML=`

<div class="item">

👤 ${p.name}

<br>

📦 Всього продукції:
${p.products} шт

<br>

💰 Зарплата:
${p.salary.toLocaleString("uk-UA")} грн

<br>

📈 Здач:
${p.deliveries}

</div>

`;


};







// ==========================
// ЦІНИ
// ==========================


document
.getElementById("savePrices")
.onclick=()=>{


prices.alcohol2 =
Number(
document.getElementById("priceAlcohol2").value
)
|| prices.alcohol2;



prices.alcohol3 =
Number(
document.getElementById("priceAlcohol3").value
)
|| prices.alcohol3;



prices.parsley2 =
Number(
document.getElementById("priceParsley2").value
)
|| prices.parsley2;



prices.parsley3 =
Number(
document.getElementById("priceParsley3").value
)
|| prices.parsley3;



localStorage.setItem(
"revenant_prices",
JSON.stringify(prices)
);



showToast(
"Ціни оновлено"
);


};







// ==========================
// ДОПОМІЖНЕ
// ==========================


function clearForm(){


document
.querySelectorAll(".calculator input")
.forEach(
i=>{

if(i.id!=="playerName")
i.value=0;


}
);


document.getElementById(
"playerName"
).value="";


calculate();


}



function showToast(text){


let t =
document.getElementById(
"toast"
);


t.innerHTML=text;

t.style.opacity=1;



setTimeout(()=>{

t.style.opacity=0;

},2500);


}








function render(){

renderTop();

renderHistory();

renderStats();

}





window.onload=()=>{


let savedPrices =
JSON.parse(

localStorage.getItem(
"revenant_prices"

)

);



if(savedPrices){

prices=savedPrices;

}



render();

calculate();


};
// Тестове додавання працівника в Firebase

import { ref, set } from "firebase/database";

function addWorker() {
  set(ref(database, "workers/Davyd"), {
    name: "Давид",
    products: 0,
    totalProducts: 0,
    lastUpdate: new Date().toLocaleDateString()
  });

  alert("Працівник доданий!");
}
window.addWorker = addWorker;
