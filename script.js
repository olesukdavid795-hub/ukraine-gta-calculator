// ========================================
// REVENANT V2
// Script Part 1
// ========================================

// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    get,
    remove,
    update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";



// ========================================
// Firebase Config
// ========================================

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
const db = getDatabase(app);



// ========================================
// Дані
// ========================================

let workers = [];
let history = [];
let selectedWorker = null;



// ========================================
// Ціни
// ========================================

let prices = {

    alcohol2:900,
    alcohol3:1200,

    parsley2:800,
    parsley3:1100

};



// ========================================
// Toast
// ========================================

function toast(text){

    const box = document.getElementById("toast");

    if(!box) return;

    box.textContent = text;

    box.style.opacity = 1;

    setTimeout(()=>{

        box.style.opacity = 0;

    },2500);

}



// ========================================
// Допоміжні функції
// ========================================

function qs(id){

    return document.getElementById(id);

}

function value(id){

    return Number(qs(id)?.value || 0);

}
// ========================================
// КАЛЬКУЛЯТОР
// ========================================

function calculate(){

    const alcohol2 = value("alcohol2");
    const alcohol3 = value("alcohol3");

    const parsley2 = value("parsley2");
    const parsley3 = value("parsley3");


    const total =

        alcohol2 * prices.alcohol2 +

        alcohol3 * prices.alcohol3 +

        parsley2 * prices.parsley2 +

        parsley3 * prices.parsley3;


    const totalBox = qs("total");

    if(totalBox){

        totalBox.textContent =
        total.toLocaleString("uk-UA") + " грн";

    }


    return total;

}



// ========================================
// АВТОРОЗРАХУНОК
// ========================================

[
"alcohol2",
"alcohol3",
"parsley2",
"parsley3"

].forEach(id=>{

    const input = qs(id);

    if(input){

        input.addEventListener(
            "input",
            calculate
        );

    }

});



// ========================================
// ОЧИЩЕННЯ КАЛЬКУЛЯТОРА
// ========================================

function clearCalculator(){

    [
    "playerName",
    "alcohol2",
    "alcohol3",
    "parsley2",
    "parsley3"

    ].forEach(id=>{

        const input = qs(id);

        if(!input) return;

        if(id==="playerName"){

            input.value="";

        }else{

            input.value=0;

        }

    });


    calculate();

}
// ========================================
// ЗБЕРЕЖЕННЯ ЗДАЧІ
// ========================================

async function saveDelivery(){

    const name = qs("playerName")?.value.trim();

    if(!name){

        toast("Введіть нік працівника");
        return;

    }

    const alcohol2 = value("alcohol2");
    const alcohol3 = value("alcohol3");
    const parsley2 = value("parsley2");
    const parsley3 = value("parsley3");

    const products =
        alcohol2 +
        alcohol3 +
        parsley2 +
        parsley3;

    const salary = calculate();

    const workerRef = ref(db,"workers/"+name);

    const snapshot = await get(workerRef);

    let worker;

    if(snapshot.exists()){

        worker = snapshot.val();

    }else{

        worker = {

            name:name,

            salary:0,

            products:0,

            deliveries:0,

            alcohol2:0,
            alcohol3:0,

            parsley2:0,
            parsley3:0,

            created:new Date().toLocaleString("uk-UA")

        };

    }


    worker.salary += salary;
    worker.products += products;
    worker.deliveries++;

    worker.alcohol2 += alcohol2;
    worker.alcohol3 += alcohol3;

    worker.parsley2 += parsley2;
    worker.parsley3 += parsley3;

    worker.lastUpdate =
    new Date().toLocaleString("uk-UA");


    await set(workerRef,worker);


    await set(

        ref(db,"history/"+Date.now()),

        {

            name,

            products,

            salary,

            alcohol2,
            alcohol3,

            parsley2,
            parsley3,

            date:new Date().toLocaleString("uk-UA")

        }

    );


    toast("Здачу успішно збережено ✅");


    clearCalculator();

    loadWorkers();

}



// ========================================
// КНОПКА ЗБЕРЕГТИ
// ========================================

const saveBtn = qs("saveSalary");

if(saveBtn){

    saveBtn.addEventListener(
        "click",
        saveDelivery
    );

}
// ========================================
// ЗАВАНТАЖЕННЯ ПРАЦІВНИКІВ
// ========================================

async function loadWorkers(){

    const snapshot = await get(ref(db,"workers"));

    workers = [];

    if(snapshot.exists()){

        snapshot.forEach(item=>{

            workers.push(item.val());

        });

    }

    renderTop();
    renderStatistics();
    loadHistory();

}



// ========================================
// ТОП ПРАЦІВНИКІВ
// ========================================

function renderTop(){

    const box = qs("topPlayers");

    if(!box) return;

    box.innerHTML = "";

    const top = [...workers]

    .sort((a,b)=>

        Number(b.salary||0) -

        Number(a.salary||0)

    );



    if(top.length===0){

        box.innerHTML = `

        <div class="item">

        Працівників поки немає

        </div>

        `;

        return;

    }



    top.forEach((worker,index)=>{

        box.innerHTML += `

        <div class="item">

            <h3>🏆 ${index+1} місце</h3>

            <p>👤 ${worker.name}</p>

            <p>📦 ${Number(worker.products||0)} шт</p>

            <p>💰 ${Number(worker.salary||0).toLocaleString("uk-UA")} грн</p>

            <p>📈 ${Number(worker.deliveries||0)} здач</p>

        </div>

        `;

    });

}
// ========================================
// ІСТОРІЯ ЗДАЧ
// ========================================


    const box = qs("history");

    if(!box) return;

    box.innerHTML = "";

    const snapshot = await get(ref(db,"history"));

    if(!snapshot.exists()){

        box.innerHTML = `
        <div class="item">
            Історія порожня
        </div>
        `;

        return;
    }

    let list = [];

    snapshot.forEach(item=>{

        list.push(item.val());

    });

    list.reverse();

    list.forEach(h=>{

        box.innerHTML += `

        <div class="item">

            <h3>👤 ${h.name}</h3>

            <p>📦 ${Number(h.products||0)} шт</p>

            <p>💰 ${Number(h.salary||0).toLocaleString("uk-UA")} грн</p>

            <p>🕒 ${h.date}</p>

        </div>

        `;

    });

}



// ========================================
// ЗАГАЛЬНА СТАТИСТИКА
// ========================================

function renderStatistics(){

    const box = qs("statistics");

    if(!box) return;

    let salary = 0;
    let products = 0;
    let deliveries = 0;

    workers.forEach(w=>{

        salary += Number(w.salary||0);
        products += Number(w.products||0);
        deliveries += Number(w.deliveries||0);

    });

    box.innerHTML = `

    <div class="item">
        👥 Працівників
        <h2>${workers.length}</h2>
    </div>

    <div class="item">
        📦 Продукції
        <h2>${products}</h2>
    </div>

    <div class="item">
        📈 Здач
        <h2>${deliveries}</h2>
    </div>

    <div class="item">
        💰 Зароблено
        <h2>${salary.toLocaleString("uk-UA")} грн</h2>
    </div>

    `;

}
// ========================================
// ІСТОРІЯ ЗДАЧ
// ========================================

async function loadHistory(){

    const box = qs("history");

    if(!box) return;

    box.innerHTML = "";

    const snapshot = await get(ref(db,"history"));

    if(!snapshot.exists()){

        box.innerHTML = `
        <div class="item">
            Історія порожня
        </div>
        `;

        return;
    }

    let list = [];

    snapshot.forEach(item=>{

        list.push(item.val());

    });

    list.reverse();

    list.forEach(h=>{

        box.innerHTML += `

        <div class="item">

            <h3>👤 ${h.name}</h3>

            <p>📦 ${Number(h.products||0)} шт</p>

            <p>💰 ${Number(h.salary||0).toLocaleString("uk-UA")} грн</p>

            <p>🕒 ${h.date}</p>

        </div>

        `;

    });

}



// ========================================
// ЗАГАЛЬНА СТАТИСТИКА
// ========================================

function renderStatistics(){

    const box = qs("statistics");

    if(!box) return;

    let salary = 0;
    let products = 0;
    let deliveries = 0;

    workers.forEach(w=>{

        salary += Number(w.salary||0);
        products += Number(w.products||0);
        deliveries += Number(w.deliveries||0);

    });

    box.innerHTML = `

    <div class="item">
        👥 Працівників
        <h2>${workers.length}</h2>
    </div>

    <div class="item">
        📦 Продукції
        <h2>${products}</h2>
    </div>

    <div class="item">
        📈 Здач
        <h2>${deliveries}</h2>
    </div>

    <div class="item">
        💰 Зароблено
        <h2>${salary.toLocaleString("uk-UA")} грн</h2>
    </div>

    `;

}
// ========================================
// ВИДАЛЕННЯ ПРАЦІВНИКА
// ========================================

window.deleteSelectedWorker = async function(){

    if(!selectedWorker){

        toast("Оберіть працівника");
        return;

    }

    if(!confirm("Видалити працівника?")) return;

    await remove(
        ref(db,"workers/"+selectedWorker)
    );

    toast("Працівника видалено");

    selectedWorker = null;

    if(qs("playerProfile")){
        qs("playerProfile").innerHTML="";
    }

    loadWorkers();

};



// ========================================
// ОЧИЩЕННЯ ТОПУ
// ========================================

const clearTopBtn = qs("clearTop");

if(clearTopBtn){

    clearTopBtn.onclick = async ()=>{

        if(!confirm("Очистити ТОП працівників?")) return;

        await remove(
            ref(db,"workers")
        );

        workers=[];

        renderTop();

        renderStatistics();

        toast("ТОП очищено");

    };

}



// ========================================
// ОЧИЩЕННЯ ІСТОРІЇ
// ========================================

const clearHistoryBtn = qs("clearHistory");

if(clearHistoryBtn){

    clearHistoryBtn.onclick = async ()=>{

        if(!confirm("Очистити історію?")) return;

        await remove(
            ref(db,"history")
        );

        loadHistory();

        toast("Історію очищено");

    };

}



// ========================================
// ЗМІНА ЦІН
// ========================================

const savePricesBtn = qs("savePrices");

if(savePricesBtn){

    savePricesBtn.onclick = ()=>{

        prices.alcohol2 =
        Number(qs("priceAlcohol2")?.value) || prices.alcohol2;

        prices.alcohol3 =
        Number(qs("priceAlcohol3")?.value) || prices.alcohol3;

        prices.parsley2 =
        Number(qs("priceParsley2")?.value) || prices.parsley2;

        prices.parsley3 =
        Number(qs("priceParsley3")?.value) || prices.parsley3;

        toast("Ціни оновлено");

        calculate();

    };

}



// ========================================
// ЗАПУСК
// ========================================

window.addEventListener("load",()=>{

    calculate();

    loadWorkers();

});



// ========================================
// ЗАХИСТ
// ========================================

document.addEventListener("contextmenu",e=>e.preventDefault());

document.addEventListener("keydown",e=>{

    if(
        e.key==="F12" ||
        (e.ctrlKey && e.shiftKey && e.key==="I") ||
        (e.ctrlKey && e.shiftKey && e.key==="J") ||
        (e.ctrlKey && e.key==="U")
    ){

        e.preventDefault();

    }

});
