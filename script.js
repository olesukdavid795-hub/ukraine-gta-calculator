// ===============================
// REVENANT V2
// FIREBASE SYSTEM
// ===============================


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    get,
    remove,
    update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";



// Firebase налаштування

const firebaseConfig = {

apiKey: "AIzaSyB-rv0vO2ZN_BYhraPNBIKhvTahrtEB9D8",

authDomain: "revenant-v2-955dc.firebaseapp.com",

databaseURL:
"https://revenant-v2-955dc-default-rtdb.firebaseio.com",

projectId: "revenant-v2-955dc",

storageBucket:
"revenant-v2-955dc.firebasestorage.app",

messagingSenderId:"888954510701",

appId:
"1:888954510701:web:84dc99929d5b82ee564e64"

};



const app = initializeApp(firebaseConfig);


const db = getDatabase(app);



// ===============================
// ЦІНИ
// ===============================


let prices = {


alcohol2:900,


alcohol3:1200,


parsley2:800,


parsley3:1100


};



// ===============================
// ДАНІ
// ===============================


let workers = [];

let history = [];

let selectedWorker = null;



// ===============================
// TOAST
// ===============================


function toast(message){


const box =
document.getElementById("toast");


box.innerHTML = message;


box.style.opacity = 1;


setTimeout(()=>{

box.style.opacity = 0;

},2500);


}



// ===============================
// КАЛЬКУЛЯТОР
// ===============================


function calculate(){


let alcohol2 =
Number(document.getElementById("alcohol2").value)||0;


let alcohol3 =
Number(document.getElementById("alcohol3").value)||0;


let parsley2 =
Number(document.getElementById("parsley2").value)||0;


let parsley3 =
Number(document.getElementById("parsley3").value)||0;



let total =

alcohol2 * prices.alcohol2 +

alcohol3 * prices.alcohol3 +

parsley2 * prices.parsley2 +

parsley3 * prices.parsley3;



document.getElementById("total").innerHTML =

total.toLocaleString("uk-UA")+" грн";



return {


alcohol2,

alcohol3,

parsley2,

parsley3,

products:
alcohol2+
alcohol3+
parsley2+
parsley3,

total

};


}



document.addEventListener(
"input",
calculate
);
// ===============================
// ДОДАВАННЯ ПРАЦІВНИКА
// ===============================


const addWorkerBtn =
document.getElementById("addWorkerBtn");


if(addWorkerBtn){


addWorkerBtn.onclick = async ()=>{


let name =
document.getElementById("newWorkerName").value.trim();



if(!name){

toast("Введіть нік працівника");

return;

}



let worker = {


name:name,


salary:0,


products:0,


deliveries:0,


alcohol2:0,


alcohol3:0,


parsley2:0,


parsley3:0,


created:
new Date().toLocaleString("uk-UA")


};




await set(
ref(db,"workers/"+name),
worker
);



toast("Працівника додано");



document.getElementById("newWorkerName").value="";



loadWorkers();



};



}





// ===============================
// ЗБЕРЕГТИ ЗДАЧУ
// ===============================


const saveSalary =
document.getElementById("saveSalary");



if(saveSalary){



saveSalary.onclick = async ()=>{



let name =
document.getElementById("playerName").value.trim();



if(!name){


toast("Введіть нік працівника");


return;


}




let data = calculate();



let workerRef =
ref(db,"workers/"+name);



let snapshot =
await get(workerRef);




let worker;



if(snapshot.exists()){


worker=snapshot.val();



}else{


worker={


name:name,


salary:0,


products:0,


deliveries:0,


alcohol2:0,


alcohol3:0,


parsley2:0,


parsley3:0


};


}





worker.salary += data.total;


worker.products += data.products;


worker.deliveries++;


worker.alcohol2 += data.alcohol2;


worker.alcohol3 += data.alcohol3;


worker.parsley2 += data.parsley2;


worker.parsley3 += data.parsley3;



worker.lastUpdate =
new Date().toLocaleString("uk-UA");





await set(
workerRef,
worker
);





await set(

ref(
db,
"history/"+Date.now()
),

{


name:name,


...data,


date:
new Date().toLocaleString("uk-UA")


}

);




toast("Здачу збережено ✅");


// Очищення калькулятора

document.getElementById("playerName").value = "";

document.getElementById("alcohol2").value = 0;

document.getElementById("alcohol3").value = 0;

document.getElementById("parsley2").value = 0;

document.getElementById("parsley3").value = 0;


// Оновити суму

calculate();


loadWorkers();


};



}
// ===============================
// ВХІД ВЛАСНИКА
// ===============================


const ownerLogin =
document.getElementById("ownerLogin");


if(ownerLogin){


ownerLogin.onclick = ()=>{


let password =
document.getElementById("ownerPassword").value;



if(password === "Revenant 0102105"){


document
.getElementById("ownerPanel")
.classList.remove("hidden");



toast("Доступ власника відкрито 👑");



}else{


toast("Невірний пароль");


}


};


}





// ===============================
// ПОШУК ПРАЦІВНИКА
// ===============================


const searchPlayer =
document.getElementById("searchPlayer");



if(searchPlayer){



searchPlayer.oninput = ()=>{



let name =
searchPlayer.value.trim().toLowerCase();



let worker =
workers.find(
w=>w.name.toLowerCase()===name
);



let box =
document.getElementById("playerProfile");



if(!worker){


box.innerHTML =
"<div class='item'>Працівника не знайдено</div>";

return;


}



selectedWorker = worker.name;



box.innerHTML = `


<div class="item">


<h3>👤 ${worker.name}</h3>


<p>📦 Всього продукції:
${worker.products} шт</p>


<p>💰 Зароблено:
${Number(worker.salary || 0).toLocaleString("uk-UA")} грн</p>


<p>📈 Здач:
${worker.deliveries}</p>


<hr>


<p>🍾 Алкоголь ⭐⭐:
${worker.alcohol2}</p>


<p>🍾 Алкоголь ⭐⭐⭐:
${worker.alcohol3}</p>


<p>🌿 Петрушка ⭐⭐:
${worker.parsley2}</p>


<p>🌿 Петрушка ⭐⭐⭐:
${worker.parsley3}</p>



<button onclick="deleteSelectedWorker()">

🗑 Видалити

</button>



</div>


`;



};



}





// ===============================
// ВИДАЛЕННЯ ПРАЦІВНИКА
// ===============================


window.deleteSelectedWorker = async function(){



if(!selectedWorker){


toast("Виберіть працівника");


return;


}



let check =
confirm(
"Видалити працівника "+selectedWorker+"?"
);



if(!check) return;



await remove(
ref(db,"workers/"+selectedWorker)
);



toast("Працівника видалено 🗑");



selectedWorker=null;



document.getElementById(
"playerProfile"
).innerHTML="";



loadWorkers();



};
// ===============================
// ЗАВАНТАЖЕННЯ ПРАЦІВНИКІВ
// ===============================


async function loadWorkers(){


let snapshot =
await get(ref(db,"workers"));



workers=[];



if(snapshot.exists()){



snapshot.forEach((item)=>{


workers.push(item.val());


});


}



renderWorkers();

renderStatistics();

loadHistory();


}





// ===============================
// ТОП ПРАЦІВНИКІВ
// ===============================


function renderWorkers(){



let box =
document.getElementById("topPlayers");



if(!box) return;



box.innerHTML="";



let top =
[...workers]
.sort(
(a,b)=>
Number(b.salary||0)-Number(a.salary||0)
)
.slice(0,10);




top.forEach((w,index)=>{


box.innerHTML += `


<div class="item">


<h3>
🏆 ${index+1} місце
</h3>


<p>
👤 ${w.name}
</p>


<p>
📦 ${w.products} шт
</p>


<p>
💰 ${Number(w.salary||0).toLocaleString("uk-UA")} грн
</p>


</div>


`;



});



}





// ===============================
// СТАТИСТИКА
// ===============================


function renderStatistics(){



let workersCount =
document.getElementById("workersCount");


let productsCount =
document.getElementById("productsCount");


let moneyCount =
document.getElementById("moneyCount");



if(!workersCount) return;



let products=0;

let money=0;



workers.forEach(w=>{


products += Number(w.products||0);


money += Number(w.salary||0);


});



workersCount.innerHTML =
workers.length;



productsCount.innerHTML =
products+" шт";



moneyCount.innerHTML =
money.toLocaleString("uk-UA")+" грн";



}





// ===============================
// ІСТОРІЯ
// ===============================


async function loadHistory(){



let snapshot =
await get(ref(db,"history"));



let box =
document.getElementById("history");



if(!box) return;



box.innerHTML="";



if(snapshot.exists()){



let data=[];



snapshot.forEach(item=>{


data.push(item.val());


});



data.reverse();



data.slice(0,30).forEach(h=>{



box.innerHTML += `


<div class="item">


<h3>
👤 ${h.name}
</h3>


<p>
📦 ${h.products} шт
</p>


<p>
💰 ${Number(h.total||0).toLocaleString("uk-UA")} грн
</p>


<p>
🕒 ${h.date}
</p>


</div>


`;



});


}



}
// ===============================
// ЗМІНА ЦІН ВЛАСНИКОМ
// ===============================


const savePrices =
document.getElementById("savePrices");


if(savePrices){


savePrices.onclick = ()=>{


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



toast("Ціни оновлено 💰");


};



}





// ===============================
// ОБНУЛЕННЯ ПРАЦІВНИКА
// ===============================


const resetWorker =
document.getElementById("resetWorker");



if(resetWorker){



resetWorker.onclick = async ()=>{



if(!selectedWorker){


toast("Спочатку виберіть працівника");


return;


}



let check =
confirm(
"Обнулити статистику "+selectedWorker+"?"
);



if(!check) return;



await update(

ref(db,"workers/"+selectedWorker),

{


salary:0,


products:0,


deliveries:0,


alcohol2:0,


alcohol3:0,


parsley2:0,


parsley3:0


}

);



toast("Статистику обнулено 🔄");



loadWorkers();



};



}





// ===============================
// СТАРТ ПРОГРАМИ
// ===============================


window.addEventListener(
"load",
()=>{


calculate();


loadWorkers();


});
// ===============================
// ПОВНЕ ОЧИЩЕННЯ ТОПУ
// ===============================

const clearTop =
document.getElementById("clearTop");


if(clearTop){

clearTop.onclick = async ()=>{


let confirmClear =
confirm(
"Видалити весь ТОП працівників?"
);


if(!confirmClear) return;



await remove(
ref(db,"workers")
);



workers = [];



renderWorkers();

renderStatistics();



toast(
"ТОП працівників повністю очищено 🏆"
);



};

}


// ===============================
// ОЧИЩЕННЯ ІСТОРІЇ
// ===============================

const clearHistory = document.getElementById("clearHistory");


if(clearHistory){

clearHistory.onclick = async ()=>{


let confirmClear = confirm(
"Видалити всю історію здач?"
);


if(!confirmClear) return;


await remove(
ref(db,"history")
);


toast("Історію очищено 📜");


loadHistory();


};

}
// ===============================
// ЗАХИСТ ВІД ПРОСТОГО ПЕРЕГЛЯДУ
// ===============================


// Вимкнути праву кнопку миші

document.addEventListener(
"contextmenu",
function(e){
    e.preventDefault();
});



// Заблокувати F12 та комбінації

document.addEventListener(
"keydown",
function(e){


if(
    e.key === "F12" ||

    (e.ctrlKey && e.shiftKey && e.key === "I") ||

    (e.ctrlKey && e.shiftKey && e.key === "J") ||

    (e.ctrlKey && e.key === "U")
){

    e.preventDefault();

    return false;

}


});
