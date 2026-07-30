// ========================================
// REVENANT v3
// PART 1
// FIREBASE + CORE
// ========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    get,
    set,
    push,
    update,
    remove,
    onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {

    apiKey:"AIzaSyB-rv0vO2ZN_BYhraPNBIKhvTahrtEB9D8",

    authDomain:"revenant-v2-955dc.firebaseapp.com",

    databaseURL:"https://revenant-v2-955dc-default-rtdb.firebaseio.com",

    projectId:"revenant-v2-955dc",

    storageBucket:"revenant-v2-955dc.firebasestorage.app",

    messagingSenderId:"888954510701",

    appId:"1:888954510701:web:84dc99929d5b82ee564e64"

};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

// ========================================
// GLOBAL DATA
// ========================================

let workers = {};

let state = {
    history: {}
};
// ========================================
// GLOBAL STATE
// ========================================

const state = {

    prices:{
        alcohol2:900,
        alcohol3:1200,
        parsley2:800,
        parsley3:1100
    },

    workers:{},

    history:{},

    owner:false,

    selectedWorker:null

};

// ========================================
// HELPERS
// ========================================

const $ = id => document.getElementById(id);

const num = value => Number(value)||0;

function money(value){

    return Number(value || 0).toLocaleString("uk-UA")+" грн";

}

function toast(text,type="success"){

    const toast = $("toast");

    if(!toast) return;

    toast.textContent=text;

    toast.className="";

    toast.classList.add(type);

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

}

function randomCode(){

    const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code="";

    for(let i=0;i<6;i++){

        code+=chars[Math.floor(Math.random()*chars.length)];

    }

    return code;

}

// ========================================
// DOM
// ========================================

const DOM={

playerName:$("playerName"),

alcohol2:$("alcohol2"),
alcohol3:$("alcohol3"),
parsley2:$("parsley2"),
parsley3:$("parsley3"),

total:$("total"),

saveSalary:$("saveSalary"),

workersCount:$("workersCount"),
productsCount:$("productsCount"),
moneyCount:$("moneyCount"),

topPlayers:$("topPlayers"),

history:$("history"),

ownerPassword:$("ownerPassword"),
ownerLogin:$("ownerLogin"),
ownerPanel:$("ownerPanel"),

searchPlayer:$("searchPlayer"),

playerProfile:$("playerProfile"),

newWorkerName:$("newWorkerName"),

addWorkerBtn:$("addWorkerBtn"),

priceAlcohol2:$("priceAlcohol2"),
priceAlcohol3:$("priceAlcohol3"),
priceParsley2:$("priceParsley2"),
priceParsley3:$("priceParsley3"),

savePrices:$("savePrices"),

clearTop:$("clearTop"),
clearHistory:$("clearHistory"),

deleteWorker:$("deleteWorker"),
resetWorker:$("resetWorker")

};

// ========================================
// COPY CODE
// ========================================

window.copyWorkerCode=function(code){

    navigator.clipboard.writeText(code);

    toast("Код скопійовано");

};
// ========================================
// PART 2
// FIREBASE LOADERS
// ========================================

async function loadPrices(){

    const snapshot = await get(ref(db,"prices"));

    if(snapshot.exists()){

        state.prices = {

            ...state.prices,
            ...snapshot.val()

        };

    }else{

        await set(ref(db,"prices"),state.prices);

    }

    DOM.priceAlcohol2.value = state.prices.alcohol2;
    DOM.priceAlcohol3.value = state.prices.alcohol3;
    DOM.priceParsley2.value = state.prices.parsley2;
    DOM.priceParsley3.value = state.prices.parsley3;

}

// ========================================
// AUTO GENERATE CODES
// ========================================

async function ensureWorkerCodes(){

    const workersRef = ref(db,"workers");

    const snapshot = await get(workersRef);

    if(!snapshot.exists()) return;

    const workers = snapshot.val();

    for(const name in workers){

        const worker = workers[name];

        let changed = false;

        if(!worker.code){

            worker.code = randomCode();
            changed = true;

        }

        if(!worker.name){

            worker.name = name;
            changed = true;

        }

        if(!worker.created){

            worker.created =
                new Date().toLocaleString("uk-UA");

            changed = true;

        }

        if(changed){

            await update(
                ref(db,"workers/"+name),
                worker
            );

        }

    }

}

// ========================================
// FIREBASE LISTENERS
// ========================================

function startListeners(){

    onValue(
        ref(db,"workers"),
        snapshot=>{

            state.workers =
                snapshot.exists()
                ? snapshot.val()
                : {};

            renderStatistics();

            renderTop();

            if(state.selectedWorker){

                renderProfile(
                    state.selectedWorker
                );

            }

        }
    );

    onValue(
        ref(db,"history"),
        snapshot=>{

            state.history =
                snapshot.exists()
                ? snapshot.val()
                : {};

            renderHistory();

        }
    );

}
// ========================================
// PART 3
// CALCULATOR
// ========================================

function calculate(){

    const salary =

        num(DOM.alcohol2.value) * state.prices.alcohol2 +

        num(DOM.alcohol3.value) * state.prices.alcohol3 +

        num(DOM.parsley2.value) * state.prices.parsley2 +

        num(DOM.parsley3.value) * state.prices.parsley3;

    DOM.total.textContent = money(salary);

    return salary;

}

[
    DOM.alcohol2,
    DOM.alcohol3,
    DOM.parsley2,
    DOM.parsley3
].forEach(input=>{

    input.addEventListener("input",calculate);

});

function clearCalculator(){

    DOM.playerName.value="";

    DOM.alcohol2.value=0;
    DOM.alcohol3.value=0;
    DOM.parsley2.value=0;
    DOM.parsley3.value=0;

    calculate();

}
// ========================================
// PART 4
// SAVE DELIVERY
// ========================================

async function saveDelivery(){

    const name = DOM.playerName.value.trim();

    if(!name){

        toast("Введіть нік працівника","error");
        return;

    }

    const workerRef = ref(db,"workers/"+name);

    const snapshot = await get(workerRef);

    let worker;

    if(snapshot.exists()){

        worker = snapshot.val();

    }else{

        worker={

            name:name,

            code:randomCode(),

            created:new Date().toLocaleString("uk-UA"),

            alcohol2:0,
            alcohol3:0,
            parsley2:0,
            parsley3:0,

            products:0,

            earned:0,

            deliveries:0

        };

    }

    const alcohol2 = num(DOM.alcohol2.value);
    const alcohol3 = num(DOM.alcohol3.value);
    const parsley2 = num(DOM.parsley2.value);
    const parsley3 = num(DOM.parsley3.value);

    const products =
        alcohol2+
        alcohol3+
        parsley2+
        parsley3;

    const salary = calculate();

    worker.alcohol2 = num(worker.alcohol2)+alcohol2;
    worker.alcohol3 = num(worker.alcohol3)+alcohol3;
    worker.parsley2 = num(worker.parsley2)+parsley2;
    worker.parsley3 = num(worker.parsley3)+parsley3;

    worker.products = num(worker.products)+products;

    worker.earned = num(worker.earned)+salary;

    worker.deliveries = num(worker.deliveries)+1;

    await set(workerRef,worker);

    await push(

        ref(db,"history"),

        {

            player:name,

            alcohol2,
            alcohol3,
            parsley2,
            parsley3,

            products,

            earned:salary,

            date:new Date().toLocaleString("uk-UA")

        }

    );

    clearCalculator();

    toast("Здачу збережено");

}

DOM.saveSalary.addEventListener(
    "click",
    saveDelivery
);
// ========================================
// PART 5
// WORKERS SYSTEM
// ========================================

async function loadWorkers(){

    const snapshot = await get(ref(db,"workers"));

    workers = snapshot.exists() ? snapshot.val() : {};

    renderWorkers();
}


// Додавання працівника
window.addWorker = async function(){

    const nameInput = document.getElementById("workerName");

    if(!nameInput) return;

    const name = nameInput.value.trim();

    if(!name){
        showToast("Введіть нік працівника");
        return;
    }


    await set(ref(db,"workers/"+name),{

        name:name,

        alcohol2:0,
        alcohol3:0,

        parsley2:0,
        parsley3:0,

        total:0,
        money:0,
        deliveries:0

    });


    nameInput.value="";

    showToast("Працівника додано ✅");

    loadWorkers();

};


// Відображення працівників
function renderWorkers(){

    const box = document.getElementById("workersList");

    if(!box) return;


    box.innerHTML="";


    Object.values(workers).forEach(worker=>{


        box.innerHTML += `

        <div class="worker-card">

            <h3>👤 ${worker.name}</h3>

            <p>📦 Продукція: ${worker.total || 0}</p>

            <p>💰 Зароблено: ${(worker.money || 0).toLocaleString()} грн</p>

            <p>📈 Здачі: ${worker.deliveries || 0}</p>


            <button onclick="openWorker('${worker.name}')">
                Профіль
            </button>

        </div>

        `;


    });

}


// Відкриття профілю
window.openWorker=function(name){

    const worker = workers[name];

    if(!worker) return;


    alert(
`👤 ${worker.name}

⭐⭐ Алкоголь: ${worker.alcohol2}
⭐⭐⭐ Алкоголь: ${worker.alcohol3}

⭐⭐ Петрушка: ${worker.parsley2}
⭐⭐⭐ Петрушка: ${worker.parsley3}

📦 Загальна продукція: ${worker.total}
💰 Зароблено: ${worker.money} грн
📈 Кількість здач: ${worker.deliveries}`
    );

};
// ========================================
// PART 6
// DELIVERY SAVE SYSTEM
// ========================================


window.saveDelivery = async function(){


    const workerName = document.getElementById("workerSelect")?.value 
    || document.getElementById("workerName")?.value;


    if(!workerName){
        showToast("Виберіть працівника");
        return;
    }


    const alcohol2 = Number(document.getElementById("a2")?.value || 0);
    const alcohol3 = Number(document.getElementById("a3")?.value || 0);

    const parsley2 = Number(document.getElementById("p2")?.value || 0);
    const parsley3 = Number(document.getElementById("p3")?.value || 0);



    const pricesSnap = await get(ref(db,"prices"));
    const prices = pricesSnap.exists()
    ? pricesSnap.val()
    : {
        alcohol2:900,
        alcohol3:1200,
        parsley2:800,
        parsley3:1100
    };



    const total = 
        alcohol2 +
        alcohol3 +
        parsley2 +
        parsley3;



    const money =
        alcohol2 * prices.alcohol2 +
        alcohol3 * prices.alcohol3 +
        parsley2 * prices.parsley2 +
        parsley3 * prices.parsley3;



    const workerRef = ref(db,"workers/"+workerName);

    const workerSnap = await get(workerRef);



    let worker = workerSnap.exists()
    ? workerSnap.val()
    :
    {
        name:workerName,
        total:0,
        money:0,
        deliveries:0,
        alcohol2:0,
        alcohol3:0,
        parsley2:0,
        parsley3:0
    };



    worker.alcohol2 += alcohol2;
    worker.alcohol3 += alcohol3;

    worker.parsley2 += parsley2;
    worker.parsley3 += parsley3;


    worker.total += total;

    worker.money += money;

    worker.deliveries += 1;



    await set(workerRef,worker);



    // історія

    await push(ref(db,"history"),{

        worker:workerName,

        alcohol2,
        alcohol3,

        parsley2,
        parsley3,

        total,

        money,

        date:new Date().toLocaleString()

    });



    clearCalculator();


    showToast("Здача збережена ✅");


    loadWorkers();


};






// ========================================
// PART 7
// HISTORY + TOP WORKERS
// ========================================


// Завантаження історії

async function loadHistory(){

    const snapshot = await get(ref(db,"history"));

    history = snapshot.exists()
    ? snapshot.val()
    : {};

    renderHistory();

}



// Вивід історії

function renderHistory(){

    const box = document.getElementById("historyList");

    if(!box) return;


    box.innerHTML="";


    Object.values(history)
    .reverse()
    .forEach(item=>{


        box.innerHTML += `

        <div class="history-card">

            <h3>📦 ${item.worker}</h3>

            <p>
            🍾 Алкоголь ⭐⭐: ${item.alcohol2}
            </p>

            <p>
            🍾 Алкоголь ⭐⭐⭐: ${item.alcohol3}
            </p>


            <p>
            🌿 Петрушка ⭐⭐: ${item.parsley2}
            </p>


            <p>
            🌿 Петрушка ⭐⭐⭐: ${item.parsley3}
            </p>


            <p>
            📦 Разом: ${item.total}
            </p>


            <p>
            💰 ${Number(item.money).toLocaleString()} грн
            </p>


            <small>
            ${item.date}
            </small>


        </div>

        `;


    });

}



// ТОП працівників

async function loadTop(){


    const snapshot = await get(ref(db,"workers"));


    if(!snapshot.exists()) return;


    const data = Object.values(snapshot.val());


    data.sort((a,b)=>{

        return (b.money || 0) - (a.money || 0);

    });



    renderTop(data.slice(0,10));

}



// Відображення ТОП

function renderTop(list){


    const box=document.getElementById("topList");


    if(!box) return;


    box.innerHTML="";


    list.forEach((worker,index)=>{


        box.innerHTML += `

        <div class="top-card">

            <h3>
            🏆 ${index+1}. ${worker.name}
            </h3>


            <p>
            💰 ${(worker.money || 0).toLocaleString()} грн
            </p>


            <p>
            📦 ${worker.total || 0} товару
            </p>


            <p>
            📈 ${worker.deliveries || 0} здач
            </p>


        </div>


        `;


    });


}
// ========================================
// PART 8
// OWNER PANEL
// ========================================


const OWNER_PASSWORD = "1234";



// Вхід власника

window.ownerLogin = function(){


    const pass = document.getElementById("ownerPassword")?.value;


    if(pass !== OWNER_PASSWORD){

        showToast("Невірний пароль ❌");

        return;

    }


    document.getElementById("ownerPanel").style.display="block";


    showToast("Вхід успішний 👑");

};




// Збереження цін

window.savePrices = async function(){


    const prices = {


        alcohol2:
        Number(document.getElementById("priceAlcohol2")?.value || 900),


        alcohol3:
        Number(document.getElementById("priceAlcohol3")?.value || 1200),


        parsley2:
        Number(document.getElementById("priceParsley2")?.value || 800),


        parsley3:
        Number(document.getElementById("priceParsley3")?.value || 1100)


    };



    await set(
        ref(db,"prices"),
        prices
    );


    showToast("Ціни оновлено ✅");


};




// Видалення працівника

window.deleteWorker = async function(name){


    if(!confirm("Видалити працівника?"))
    return;



    await remove(
        ref(db,"workers/"+name)
    );


    showToast("Працівника видалено 🗑️");


    loadWorkers();


};




// Очистити історію

window.clearHistory = async function(){


    if(!confirm("Очистити всю історію?"))
    return;



    await remove(
        ref(db,"history")
    );


    showToast("Історію очищено 🧹");


    loadHistory();


};




// Очистити ТОП

window.clearTop = async function(){


    if(!confirm("Очистити ТОП?"))
    return;


    const snapshot = await get(ref(db,"workers"));


    if(!snapshot.exists())
    return;



    const workersData=snapshot.val();


    for(const key in workersData){

        await update(
            ref(db,"workers/"+key),
            {
                money:0,
                total:0,
                deliveries:0
            }
        );

    }


    showToast("ТОП очищено 🏆");


    loadTop();


};
// ========================================
// PART 9
// APP START
// ========================================


// Запуск програми

window.addEventListener("DOMContentLoaded",()=>{


    loadWorkers();

    loadHistory();

    loadTop();



    const saveBtn = document.getElementById("saveDelivery");


    if(saveBtn){

        saveBtn.addEventListener(
            "click",
            saveDelivery
        );

    }



});




// ========================================
// TOAST NOTIFICATION
// ========================================

window.showToast=function(message){


    let toast=document.getElementById("toast");


    if(!toast){

        toast=document.createElement("div");

        toast.id="toast";

        document.body.appendChild(toast);

    }



    toast.innerHTML=message;


    toast.classList.add("show");



    setTimeout(()=>{

        toast.classList.remove("show");

    },2500);



};
