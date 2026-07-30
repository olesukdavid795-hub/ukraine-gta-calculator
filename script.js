/* ==========================================
   REVENANT v2 ULTIMATE
   SCRIPT
========================================== */


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

getDatabase,

ref,

set,

push,

remove,

get,

onValue

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";



/* ==========================================
   FIREBASE
========================================== */

const firebaseConfig={

apiKey:"AIzaSyB-rv0vO2ZN_BYhraPNBIKhvTahrtEB9D8",

authDomain:"revenant-v2-955dc.firebaseapp.com",

databaseURL:"https://revenant-v2-955dc-default-rtdb.firebaseio.com",

projectId:"revenant-v2-955dc",

storageBucket:"revenant-v2-955dc.firebasestorage.app",

messagingSenderId:"888954510701",

appId:"1:888954510701:web:84dc99929d5b82ee564e64"

};

const app=initializeApp(firebaseConfig);

const db=getDatabase(app);



/* ==========================================
   STATE
========================================== */

const state={

workers:{},

history:{},

prices:{

alcohol2:900,

alcohol3:1200,

parsley2:800,

parsley3:1100

},

selectedWorker:null,

owner:false

};



/* ==========================================
   OWNER
========================================== */

const OWNER_PASSWORD="RV-ULTIMATE-2026-OWNER";
/* ==========================================
   HELPERS
========================================== */

function $(id){

    return document.getElementById(id);

}


function showToast(text){

    const toast=$("toast");

    toast.textContent=text;

    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer=setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}


function formatMoney(value){

    return Number(value).toLocaleString("uk-UA")+" грн";

}


function generateWorkerCode(){

    let code="";

    do{

        code=
        "RV"+
        Math.floor(
            100000+
            Math.random()*900000
        );

    }while(

        Object.values(state.workers)

        .some(

            worker=>worker.code===code

        )

    );

    return code;

}
/* ==========================================
   MODAL
========================================== */

function closeModal(){

    $("modalOverlay")
    .classList
    .add("hidden");

    $("modalBox").innerHTML="";

}



function openModal(html){

    $("modalBox").innerHTML=html;

    $("modalOverlay")
    .classList
    .remove("hidden");

}
/* ==========================================
   OWNER LOGIN
========================================== */

$("ownerLoginBtn").onclick=()=>{

    const password=$("ownerPassword").value.trim();

    if(password!==OWNER_PASSWORD){

        showToast("❌ Неправильний пароль");

        return;

    }

    state.owner=true;

    $("ownerLogin").style.display="none";

    $("ownerPanel").style.display="block";

    $("ownerPassword").value="";

    showToast("👑 Доступ дозволено");

};
/* ==========================================
   ADD WORKER
========================================== */

$("addWorkerBtn").onclick=()=>{

    openModal(`

        <h2>👤 Новий працівник</h2>

        <div class="form-group">

            <label>Нік</label>

            <input
            id="newWorkerName"
            type="text"
            placeholder="Введіть нік">

        </div>

        <br>

        <button
        id="createWorkerBtn"
        class="btn primary">

        ➕ Створити

        </button>

    `);





    $("createWorkerBtn").onclick=async()=>{

        const nickname=

        $("newWorkerName")

        .value

        .trim();




        if(!nickname){

            showToast("Введіть нік");

            return;

        }




        const id=crypto.randomUUID();




        state.workers[id]={

            nickname,

            code:generateWorkerCode(),

            alcohol2:0,

            alcohol3:0,

            parsley2:0,

            parsley3:0,

            totalProducts:0,

            deliveries:0,

            money:0

        };




        await set(

            ref(db,"workers/"+id),

            state.workers[id]

        );




        closeModal();

        renderWorkers();

        showToast("✅ Працівника створено");

    };

};
/* ==========================================
   LOAD WORKERS
========================================== */

function loadWorkers(){

    onValue(
        ref(db,"workers"),
        snapshot=>{

            state.workers =
                snapshot.exists()
                ? snapshot.val()
                : {};

            renderWorkers();

            renderStatistics();

            renderTop();

        }
    );

}
/* ==========================================
   RENDER WORKERS
========================================== */

function renderWorkers(){

    const list=$("workersList");

    if(!list) return;

    const search=$("workerSearch").value.toLowerCase();

    list.innerHTML="";

    const workers=Object.entries(state.workers);

    if(workers.length===0){

        list.innerHTML=`
        <p class="empty">
            Працівників ще немає.
        </p>
        `;

        return;

    }

    workers.forEach(([id,worker])=>{

        if(
            search &&
            !worker.code.toLowerCase().includes(search)
        ){
            return;
        }

        const div=document.createElement("div");

        div.className="list-item";

        div.innerHTML=`

            <strong>${worker.nickname}</strong>

            <br>

            <small>${worker.code}</small>

        `;

        div.onclick=()=>{

            state.selectedWorker=id;

            renderProfile();

        };

        list.appendChild(div);

    });

}
/* ==========================================
   SEARCH
========================================== */

$("workerSearch").oninput=renderWorkers;
/* ==========================================
   WORKER PROFILE
========================================== */

function renderProfile(){

    const box=$("workerProfile");

    if(!box) return;

    if(!state.selectedWorker){

        box.innerHTML=`
            <p class="empty">
                Оберіть працівника
            </p>
        `;

        return;
    }

    const worker=state.workers[state.selectedWorker];

    if(!worker){

        box.innerHTML=`
            <p class="empty">
                Працівника не знайдено
            </p>
        `;

        return;
    }

    box.innerHTML=`

        <h2>${worker.nickname}</h2>

        <p><b>Код:</b> ${worker.code}</p>

        <hr>

        <p>🍾 Алкоголь ⭐⭐ :
        ${worker.alcohol2||0}</p>

        <p>🍾 Алкоголь ⭐⭐⭐ :
        ${worker.alcohol3||0}</p>

        <p>🌿 Петрушка ⭐⭐ :
        ${worker.parsley2||0}</p>

        <p>🌿 Петрушка ⭐⭐⭐ :
        ${worker.parsley3||0}</p>

        <hr>

        <p>
        📦 Продукція:
        <b>${worker.totalProducts||0}</b>
        </p>

        <p>
        💰 Зароблено:
        <b>${formatMoney(worker.money||0)}</b>
        </p>

        <p>
        📈 Здач:
        <b>${worker.deliveries||0}</b>
        </p>

        <br>

        <button
        id="deleteWorkerBtn"
        class="btn danger">

        🗑 Видалити працівника

        </button>

    `;

    $("deleteWorkerBtn").onclick=()=>{

        openModal(`

            <h2>⚠ Видалити працівника?</h2>

            <p>

            ${worker.nickname}

            <br>

            ${worker.code}

            </p>

            <br>

            <button
            id="confirmDeleteWorker"
            class="btn danger">

            Видалити

            </button>

        `);

        $("confirmDeleteWorker").onclick=async()=>{

            await remove(

                ref(
                    db,
                    "workers/"+state.selectedWorker
                )

            );

            state.selectedWorker=null;

            closeModal();

            showToast("Працівника видалено");

        };

    };

}
/* ==========================================
   STATISTICS
========================================== */

function renderStatistics(){

    let workers=0;
    let products=0;
    let money=0;
    let deliveries=0;

    Object.values(state.workers).forEach(worker=>{

        workers++;

        products+=worker.totalProducts||0;

        money+=worker.money||0;

        deliveries+=worker.deliveries||0;

    });

    $("statWorkers").textContent=workers;

    $("statProducts").textContent=products;

    $("statMoney").textContent=formatMoney(money);

    $("statDeliveries").textContent=deliveries;

}
/* ==========================================
   TOP
========================================== */

function renderTop(){

    const box=$("topWorkers");

    box.innerHTML="";

    const workers=Object.values(state.workers)

    .sort(

        (a,b)=>

        (b.totalProducts||0)

        -

        (a.totalProducts||0)

    );

    if(workers.length===0){

        box.innerHTML=`

        <p class="empty">

        Працівників ще немає.

        </p>

        `;

        return;

    }

    workers.forEach((worker,index)=>{

        box.innerHTML+=`

        <div class="list-item">

            <b>

            #${index+1}

            ${worker.nickname}

            </b>

            <br>

            📦

            ${worker.totalProducts||0}

        </div>

        `;

    });

}
/* ==========================================
   LOAD PRICES
========================================== */

function loadPrices(){

    onValue(

        ref(db,"prices"),

        snapshot=>{

            if(snapshot.exists()){

                state.prices=snapshot.val();

            }

            $("priceAlcohol2").value=state.prices.alcohol2;

            $("priceAlcohol3").value=state.prices.alcohol3;

            $("priceParsley2").value=state.prices.parsley2;

            $("priceParsley3").value=state.prices.parsley3;

        }

    );

}
/* ==========================================
   SAVE PRICES
========================================== */

$("savePricesBtn").onclick=async()=>{

    state.prices={

        alcohol2:Number($("priceAlcohol2").value),

        alcohol3:Number($("priceAlcohol3").value),

        parsley2:Number($("priceParsley2").value),

        parsley3:Number($("priceParsley3").value)

    };

    await set(

        ref(db,"prices"),

        state.prices

    );

    showToast("💰 Ціни збережено");

};
/* ==========================================
   SAVE DELIVERY
========================================== */

$("saveDeliveryBtn").onclick = async()=>{

    const nickname = $("workerName").value.trim();

    if(!nickname){

        showToast("Введіть нік працівника");

        return;

    }

    const id = Object.keys(state.workers).find(

        key => state.workers[key].nickname === nickname

    );

    if(!id){

        showToast("Працівника не знайдено");

        return;

    }

    const worker = state.workers[id];

    const alcohol2 = Number($("alcohol2").value);
    const alcohol3 = Number($("alcohol3").value);
    const parsley2 = Number($("parsley2").value);
    const parsley3 = Number($("parsley3").value);

    const products =
        alcohol2+
        alcohol3+
        parsley2+
        parsley3;

    const money =
        alcohol2*state.prices.alcohol2+
        alcohol3*state.prices.alcohol3+
        parsley2*state.prices.parsley2+
        parsley3*state.prices.parsley3;

    worker.alcohol2 += alcohol2;
    worker.alcohol3 += alcohol3;
    worker.parsley2 += parsley2;
    worker.parsley3 += parsley3;

    worker.totalProducts += products;
    worker.money += money;
    worker.deliveries++;

    await set(ref(db,"workers/"+id),worker);

    await push(ref(db,"history"),{

        worker:worker.nickname,
        code:worker.code,
        products,
        money,
        date:new Date().toLocaleString("uk-UA")

    });

    $("workerName").value="";
    $("alcohol2").value=0;
    $("alcohol3").value=0;
    $("parsley2").value=0;
    $("parsley3").value=0;

    showToast("✅ Здачу збережено");

};
/* ==========================================
   HISTORY
========================================== */

function loadHistory(){

    onValue(

        ref(db,"history"),

        snapshot=>{

            state.history=

            snapshot.exists()

            ? snapshot.val()

            : {};

            renderHistory();

        }

    );

}



function renderHistory(){

    const box=$("historyList");

    box.innerHTML="";

    const history=Object.values(state.history).reverse();

    if(history.length===0){

        box.innerHTML=`
        <p class="empty">
        Історія порожня
        </p>`;

        return;

    }

    history.forEach(item=>{

        box.innerHTML+=`

        <div class="list-item">

            <b>${item.worker}</b>

            <br>

            📦 ${item.products}

            <br>

            💰 ${formatMoney(item.money)}

            <br>

            🕒 ${item.date}

        </div>

        `;

    });

}
/* ==========================================
   CLEAR
========================================== */

$("clearHistoryBtn").onclick=async()=>{

    openModal(`

        <h2>Очистити історію?</h2>

        <br>

        <button
        id="confirmHistory"
        class="btn danger">

        Очистити

        </button>

    `);

    $("confirmHistory").onclick=async()=>{

        await remove(ref(db,"history"));

        closeModal();

        showToast("Історію очищено");

    };

};



$("clearTopBtn").onclick=()=>{

    showToast("ТОП оновлюється автоматично на основі статистики працівників.");

};
