// ========================================
// REVENANT v2
// MAIN SCRIPT
// ========================================


// ========================================
// FIREBASE
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

    apiKey: "AIzaSyB-rv0vO2ZN_BYhraPNBIKhvTahrtEB9D8",

    authDomain: "revenant-v2-955dc.firebaseapp.com",

    databaseURL:
    "https://revenant-v2-955dc-default-rtdb.firebaseio.com",

    projectId: "revenant-v2-955dc",

    storageBucket:
    "revenant-v2-955dc.firebasestorage.app",

    messagingSenderId:
    "888954510701",

    appId:
    "1:888954510701:web:84dc99929d5b82ee564e64"

};


const app = initializeApp(firebaseConfig);

const db = getDatabase(app);



// ========================================
// GLOBAL STATE
// ========================================


let state = {

    prices: {

        alcohol2:900,

        alcohol3:1200,

        parsley2:800,

        parsley3:1100

    },

    workers:{},

    history:{},

    selectedWorker:null,

    owner:false

};



// ========================================
// HELPERS
// ========================================


const $ = id => document.getElementById(id);


function num(value){

    return Number(value) || 0;

}


function money(value){

    return `${Number(value).toLocaleString("uk-UA")} грн`;

}
// ========================================
// GENERATE WORKER CODE
// ========================================

function generateWorkerCode(){

    const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for(let i=0;i<6;i++){

        code += chars[
            Math.floor(Math.random()*chars.length)
        ];

    }

    return code;

}
// ========================================
// ADD CODES TO OLD WORKERS
// ========================================

async function addCodesToOldWorkers(){

    const snapshot = await get(ref(db,"workers"));

    if(!snapshot.exists()) return;

    const workers = snapshot.val();

    for(const name in workers){

        if(!workers[name].code){

            await update(
                ref(db,"workers/"+name),
                {
                    code: generateWorkerCode()
                }
            );

        }

    }

}
// ========================================
// DOM ELEMENTS
// ========================================


const DOM = {

    playerName: $("playerName"),

    alcohol2: $("alcohol2"),
    alcohol3: $("alcohol3"),
    parsley2: $("parsley2"),
    parsley3: $("parsley3"),

    total: $("total"),

    saveSalary: $("saveSalary"),


    workersCount: $("workersCount"),
    productsCount: $("productsCount"),
    moneyCount: $("moneyCount"),

    topPlayers: $("topPlayers"),

    history: $("history"),


    ownerPassword: $("ownerPassword"),
    ownerLogin: $("ownerLogin"),
    ownerPanel: $("ownerPanel"),


    searchPlayer: $("searchPlayer"),
    playerProfile: $("playerProfile"),


    newWorkerName: $("newWorkerName"),
    addWorkerBtn: $("addWorkerBtn"),


    priceAlcohol2: $("priceAlcohol2"),
    priceAlcohol3: $("priceAlcohol3"),
    priceParsley2: $("priceParsley2"),
    priceParsley3: $("priceParsley3"),

    savePrices: $("savePrices"),


    deleteWorker: $("deleteWorker"),

    resetWorker: $("resetWorker"),


    clearTop: $("clearTop"),

    clearHistory: $("clearHistory"),


    toast: $("toast")

};



// ========================================
// TOAST SYSTEM
// ========================================


function toast(message,type="success"){


    if(!DOM.toast) return;


    DOM.toast.textContent = message;


    DOM.toast.className = "";


    DOM.toast.classList.add(type);


    DOM.toast.classList.add("show");



    setTimeout(()=>{

        DOM.toast.classList.remove("show");

    },2500);


}



// ========================================
// LOAD PRICES
// ========================================


async function loadPrices(){


    const snapshot = await get(
        ref(db,"prices")
    );


    if(snapshot.exists()){


        state.prices = {

            ...state.prices,

            ...snapshot.val()

        };


    }else{


        await set(
            ref(db,"prices"),
            state.prices
        );


    }



    DOM.priceAlcohol2.value =
        state.prices.alcohol2;


    DOM.priceAlcohol3.value =
        state.prices.alcohol3;


    DOM.priceParsley2.value =
        state.prices.parsley2;


    DOM.priceParsley3.value =
        state.prices.parsley3;


}


// ========================================
// CALCULATOR
// ========================================


function calculate(){


    const result =

        num(DOM.alcohol2.value) *
        state.prices.alcohol2 +


        num(DOM.alcohol3.value) *
        state.prices.alcohol3 +


        num(DOM.parsley2.value) *
        state.prices.parsley2 +


        num(DOM.parsley3.value) *
        state.prices.parsley3;



    DOM.total.textContent =
        money(result);



    return result;


}



[
DOM.alcohol2,
DOM.alcohol3,
DOM.parsley2,
DOM.parsley3

].forEach(input=>{


    input.addEventListener(
        "input",
        calculate
    );


});
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
// SAVE DELIVERY
// ========================================


async function saveDelivery(){


    const name =
        DOM.playerName.value.trim();



    if(!name){


        toast(
            "Введіть нік працівника",
            "error"
        );

        return;

    }



    const delivery = {


        alcohol2:
            num(DOM.alcohol2.value),


        alcohol3:
            num(DOM.alcohol3.value),


        parsley2:
            num(DOM.parsley2.value),


        parsley3:
            num(DOM.parsley3.value)



    };



    const products =

        delivery.alcohol2 +

        delivery.alcohol3 +

        delivery.parsley2 +

        delivery.parsley3;



    const salary =
        calculate();



    const workerRef =
        ref(
            db,
            "workers/" + name
        );



    const snapshot =
        await get(workerRef);



    let worker = {


        alcohol2:0,

        alcohol3:0,

        parsley2:0,

        parsley3:0,

        products:0,

        earned:0,

        deliveries:0


    };



    if(snapshot.exists()){


        worker = snapshot.val();


    }



    worker.alcohol2 += delivery.alcohol2;

    worker.alcohol3 += delivery.alcohol3;

    worker.parsley2 += delivery.parsley2;

    worker.parsley3 += delivery.parsley3;


    worker.products += products;

    worker.earned += salary;

    worker.deliveries += 1;



    await set(
        workerRef,
        worker
    );



    await push(
        ref(db,"history"),
        {

            player:name,

            ...delivery,


            products,

            earned:salary,


            date:
            new Date()
            .toLocaleString("uk-UA")


        }
    );



    clearCalculator();



    toast(
        "Здачу збережено"
    );


}



// ========================================
// CLEAR CALCULATOR
// ========================================


function clearCalculator(){


    DOM.playerName.value="";


    DOM.alcohol2.value=0;

    DOM.alcohol3.value=0;

    DOM.parsley2.value=0;

    DOM.parsley3.value=0;



    calculate();


}



DOM.saveSalary.addEventListener(
    "click",
    saveDelivery
);
// ========================================
// STATISTICS
// ========================================


function renderStatistics(){


    const list =
        Object.values(state.workers);



    DOM.workersCount.textContent =
        list.length;



    let products = 0;

    let moneyTotal = 0;



    list.forEach(worker=>{


        products +=
            worker.products || 0;


        moneyTotal +=
            worker.earned || 0;


    });



    DOM.productsCount.textContent =
        products;



    DOM.moneyCount.textContent =
        money(moneyTotal);


}



// ========================================
// TOP PLAYERS
// ========================================


function renderTop(){


    DOM.topPlayers.innerHTML = "";



    const top =

        Object.entries(state.workers)

        .sort(
            (a,b)=>
            (b[1].earned || 0) -
            (a[1].earned || 0)
        )

        .slice(0,10);



    if(!top.length){


        DOM.topPlayers.innerHTML =
        "<p>Даних ще немає</p>";


        return;

    }



    top.forEach(
        ([name,worker],index)=>{


        const card =
        document.createElement("div");



        card.className =
        "top-player";



        card.innerHTML = `

            <h3>
            🏆 ${index+1}. ${name}
            </h3>

            <p>
            💰 ${money(worker.earned || 0)}
            </p>

            <p>
            📦 ${worker.products || 0} шт.
            </p>

            <p>
            📈 ${worker.deliveries || 0} здач
            </p>

        `;



        DOM.topPlayers.appendChild(card);



    });


}



// ========================================
// HISTORY
// ========================================


function renderHistory(){


    DOM.history.innerHTML = "";



    const list =

    Object.values(state.history)

    .reverse();



    if(!list.length){


        DOM.history.innerHTML =
        "<p>Історія порожня</p>";


        return;


    }



    list.forEach(item=>{


        const card =
        document.createElement("div");



        card.className =
        "history-card";



        card.innerHTML = `


        <h3>
        👤 ${item.player}
        </h3>


        <p>
        🍾 Алкоголь ⭐⭐:
        ${item.alcohol2}
        </p>


        <p>
        🍾 Алкоголь ⭐⭐⭐:
        ${item.alcohol3}
        </p>


        <p>
        🌿 Петрушка ⭐⭐:
        ${item.parsley2}
        </p>


        <p>
        🌿 Петрушка ⭐⭐⭐:
        ${item.parsley3}
        </p>


        <p>
        📦 Продукція:
        ${item.products}
        </p>


        <p>
        💰 Зароблено:
        ${money(item.earned)}
        </p>


        <small>
        ${item.date}
        </small>


        `;



        DOM.history.appendChild(card);



    });


}



// ========================================
// PROFILE
// ========================================


function renderProfile(name){


    const worker =
        state.workers[name];

console.log(worker);

    if(!worker){


        DOM.playerProfile.innerHTML =
        "<p>Працівника не знайдено</p>";


        return;

    }



    state.selectedWorker = name;



    DOM.playerProfile.innerHTML = `


    <h2>
    👤 ${name}
    </h2>

<div class="worker-code">

<p>
🆔 <b>${JSON.stringify(worker)}</b>
</p>

<button
onclick="copyWorkerCode('${worker.code}')">

📋 Копіювати код

</button>

</div>

    <p>
    🍾 Алкоголь ⭐⭐:
    ${worker.alcohol2 || 0}
    </p>


    <p>
    🍾 Алкоголь ⭐⭐⭐:
    ${worker.alcohol3 || 0}
    </p>


    <p>
    🌿 Петрушка ⭐⭐:
    ${worker.parsley2 || 0}
    </p>


    <p>
    🌿 Петрушка ⭐⭐⭐:
    ${worker.parsley3 || 0}
    </p>


    <p>
    📦 Загальна продукція:
    ${worker.products || 0}
    </p>


    <p>
    💰 Зароблено:
    ${money(worker.earned || 0)}
    </p>


    <p>
    📈 Кількість здач:
    ${worker.deliveries || 0}
    </p>

<div class="profile-actions">

<button id="deleteWorkerCard">
🗑 Видалити працівника
</button>

<button id="resetWorkerCard">
🔄 Обнулити статистику
</button>

</div>

    `;
document.getElementById("deleteWorkerCard")
.addEventListener("click", deleteWorkerHandler);

document.getElementById("resetWorkerCard")
.addEventListener("click", resetWorkerHandler);

}



// ========================================
// SEARCH
// ========================================


DOM.searchPlayer.addEventListener(
    "input",
    ()=>{


        const value =
        DOM.searchPlayer.value.trim();



        if(!value){


            DOM.playerProfile.innerHTML="";
            state.selectedWorker=null;


            return;

        }



        renderProfile(value);



    }
);




// ========================================
// ADD WORKER
// ========================================


DOM.addWorkerBtn.addEventListener(
    "click",
    addWorker
);



async function addWorker(){


    const name =
        DOM.newWorkerName.value.trim();



    if(!name){


        toast(
            "Введіть нік",
            "error"
        );


        return;

    }



    const workerRef =
        ref(
            db,
            "workers/" + name
        );



    const snapshot =
        await get(workerRef);



    if(snapshot.exists()){


        toast(
            "Такий працівник вже є",
            "error"
        );


        return;

    }



   await set(
    workerRef,
    {

        code: generateWorkerCode(),

        name: name,

        created: new Date().toLocaleString("uk-UA"),

        alcohol2:0,

        alcohol3:0,

        parsley2:0,

        parsley3:0,

        products:0,

        earned:0,

        deliveries:0

    }
);



    DOM.newWorkerName.value="";



    toast(
        "Працівника додано"
    );


}



// ========================================
// SAVE PRICES
// ========================================


DOM.savePrices.addEventListener(
    "click",
    savePricesHandler
);



async function savePricesHandler(){


    state.prices = {


        alcohol2:
        num(DOM.priceAlcohol2.value),


        alcohol3:
        num(DOM.priceAlcohol3.value),


        parsley2:
        num(DOM.priceParsley2.value),


        parsley3:
        num(DOM.priceParsley3.value)


    };



    await set(
        ref(db,"prices"),
        state.prices
    );



    calculate();



    toast(
        "Ціни оновлено"
    );


}
// ========================================
// DELETE WORKER
// ========================================


DOM.deleteWorker.addEventListener(
    "click",
    deleteWorkerHandler
);



async function deleteWorkerHandler(){


    const name =
        state.selectedWorker;



    if(!name){


        toast(
            "Оберіть працівника",
            "error"
        );


        return;

    }



    await remove(
        ref(
            db,
            "workers/" + name
        )
    );



    DOM.playerProfile.innerHTML = "";

    DOM.searchPlayer.value = "";

    state.selectedWorker = null;



    toast(
        "Працівника видалено"
    );


}



// ========================================
// RESET WORKER
// ========================================


DOM.resetWorker.addEventListener(
    "click",
    resetWorkerHandler
);



async function resetWorkerHandler(){


    const name =
        state.selectedWorker;



    if(!name){


        toast(
            "Оберіть працівника",
            "error"
        );


        return;

    }



    await update(
        ref(
            db,
            "workers/" + name
        ),
        {


            alcohol2:0,

            alcohol3:0,

            parsley2:0,

            parsley3:0,


            products:0,

            earned:0,

            deliveries:0


        }
    );



    toast(
        "Статистика очищена"
    );


}



// ========================================
// CLEAR HISTORY
// ========================================


DOM.clearHistory.addEventListener(
    "click",
    async ()=>{


        await remove(
            ref(db,"history")
        );



        toast(
            "Історію очищено"
        );


    }
);



// ========================================
// CLEAR TOP
// ========================================


DOM.clearTop.addEventListener(
    "click",
    async ()=>{


        const workers =
            Object.keys(state.workers);



        for(const name of workers){


            await update(
                ref(
                    db,
                    "workers/" + name
                ),
                {


                    earned:0,

                    products:0,

                    deliveries:0


                }
            );


        }



        toast(
            "ТОП очищено"
        );


    }
);

window.addWorker = async function(){

    const input =
    document.getElementById("newWorkerName");


    if(!input || !input.value.trim()){

        toast("Введи ім'я працівника","error");
        return;

    }


    const name =
    input.value.trim();


    await set(
        ref(db,"workers/" + name),
        {

            name:name,

            alcohol2:0,
            alcohol3:0,

            parsley2:0,
            parsley3:0,

            products:0,
            earned:0,
            deliveries:0

        }
    );


    input.value="";


    toast("Працівника додано");

};




window.deleteWorker = async function(){

    const input =
    document.getElementById("workerSearch");


    if(!input || !input.value.trim()){

        toast("Введи ім'я працівника","error");
        return;

    }


    const name =
    input.value.trim();


    await remove(
        ref(db,"workers/" + name)
    );


    input.value="";


    toast("Працівника видалено");

};

// ========================================
// DELETE WORKER
// ========================================

window.deleteWorker = async function(){

    const input =
    document.getElementById("workerSearch");


    if(!input || !input.value.trim()){

        toast("Введи ім'я працівника","error");
        return;

    }


    const name =
    input.value.trim();


    await remove(
        ref(db,"workers/" + name)
    );


    input.value="";


    toast("Працівника видалено");

};

// ========================================
// START APPLICATION
// ========================================


async function init(){

    await loadPrices();

    await addCodesToOldWorkers();

    startListeners();

    calculate();

}

// ========================================
// COPY WORKER CODE
// ========================================

window.copyWorkerCode = async function(code){

    if(!code){

        toast("Код не знайдено","error");
        return;

    }

    try{

        await navigator.clipboard.writeText(code);

        toast("Код скопійовано");

    }catch{

        toast("Не вдалося скопіювати","error");

    }

}

init();
// Блокування ПКМ
document.addEventListener("contextmenu", e => {
    e.preventDefault();
});

// Блокування F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
document.addEventListener("keydown", e => {

    if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
        (e.ctrlKey && (e.key === "u" || e.key === "U"))
    ) {
        e.preventDefault();
    }

});
window.ownerLogin = function(){

    let password =
    document.getElementById("ownerPassword").value;


    if(password === "1234"){

        document.getElementById("ownerLoginBox").style.display="none";

        document.getElementById("ownerPanel").style.display="block";

    }else{

        alert("❌ Невірний пароль");

    }

}
