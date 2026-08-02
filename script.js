// ========================================
// REVENANT V3
// FIREBASE
// ========================================

import { initializeApp } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getDatabase,
ref,
get,
set,
push,
update,
remove,
onValue
} 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


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
// HELPERS
// ========================================

const $ = id => document.getElementById(id);



// ========================================
// STATE
// ========================================

const state = {

workers:{},

history:[],

prices:{

alcohol2:900,

alcohol3:1200,

parsley2:800,

parsley3:1100

},

owner:false,

selectedWorker:null

};



// ========================================
// PAGES
// ========================================

const pages=document.querySelectorAll(".page");

const menuButtons=document.querySelectorAll(".menu-btn");

menuButtons.forEach(btn=>{

btn.addEventListener("click",()=>{

menuButtons.forEach(x=>x.classList.remove("active"));

btn.classList.add("active");

pages.forEach(page=>page.classList.remove("active"));

const target=document.getElementById(

btn.dataset.page

);

if(target){

target.classList.add("active");

}

});

});



// ========================================
// TOAST
// ========================================

function toast(text){

const old=document.querySelector(".toast");

if(old){

old.remove();

}

const div=document.createElement("div");

div.className="toast";

div.innerText=text;

document.body.appendChild(div);

setTimeout(()=>{

div.classList.add("show");

},10);

setTimeout(()=>{

div.classList.remove("show");

setTimeout(()=>{

div.remove();

},300);

},2500);

}
// ========================================
// CALCULATOR
// ========================================

function calculateSalary(){

    const alcohol2 =
    Number($("alcohol2").value) || 0;

    const alcohol3 =
    Number($("alcohol3").value) || 0;

    const parsley2 =
    Number($("parsley2").value) || 0;

    const parsley3 =
    Number($("parsley3").value) || 0;

    const salary =

    alcohol2 * state.prices.alcohol2 +

    alcohol3 * state.prices.alcohol3 +

    parsley2 * state.prices.parsley2 +

    parsley3 * state.prices.parsley3;

    $("salary").textContent =
    salary.toLocaleString("uk-UA") + " грн";

    return {

        salary,

        alcohol2,

        alcohol3,

        parsley2,

        parsley3

    };

}



// ========================================
// BUTTON
// ========================================

$("calculateBtn")?.addEventListener(

"click",

calculateSalary

);



// ========================================
// CLEAR FORM
// ========================================

function clearCalculator(){

    $("workerNickname").value="";

    $("alcohol2").value=0;

    $("alcohol3").value=0;

    $("parsley2").value=0;

    $("parsley3").value=0;

    $("salary").textContent="0 грн";

}



// ========================================
// SAVE DELIVERY
// ========================================

$("saveBtn")?.addEventListener(

"click",

async()=>{

const nickname=

$("workerNickname").value.trim();

if(!nickname){

toast("Введіть нік працівника");

return;

}

const result=

calculateSalary();

const worker=

state.workers[nickname] || {

money:0,

deliveries:0,

products:0,

alcohol2:0,

alcohol3:0,

parsley2:0,

parsley3:0

};

worker.money+=result.salary;

worker.deliveries++;

worker.products+=

result.alcohol2+

result.alcohol3+

result.parsley2+

result.parsley3;

worker.alcohol2+=result.alcohol2;

worker.alcohol3+=result.alcohol3;

worker.parsley2+=result.parsley2;

worker.parsley3+=result.parsley3;

await set(

ref(db,"workers/"+nickname),

worker

);

await push(

ref(db,"history"),

{

worker:nickname,

salary:result.salary,

alcohol2:result.alcohol2,

alcohol3:result.alcohol3,

parsley2:result.parsley2,

parsley3:result.parsley3,

time:Date.now()

}

);

toast("✅ Здачу збережено");

clearCalculator();

}

);
// ========================================
// LOAD DATA
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
renderWorkersTable();

        }
    );

    onValue(
        ref(db,"history"),
        snapshot=>{

            state.history = [];

            if(snapshot.exists()){

                snapshot.forEach(item=>{

                    state.history.unshift({

                        id:item.key,

                        ...item.val()

                    });

                });

            }

            renderHistory();

        }
    );

    onValue(
        ref(db,"prices"),
        snapshot=>{

            if(snapshot.exists()){

                state.prices =
                snapshot.val();

            }

        }
    );

}



// ========================================
// STATISTICS
// ========================================

function renderStatistics(){

    const workers =
    Object.values(state.workers);

    $("workersCount").textContent =
    workers.length;

    let products=0;
    let money=0;
    let deliveries=0;

    workers.forEach(worker=>{

        products +=
        worker.products || 0;

        money +=
        worker.money || 0;

        deliveries +=
        worker.deliveries || 0;

    });

    $("totalProducts").textContent =
    products.toLocaleString("uk-UA");

    $("totalMoney").textContent =
    money.toLocaleString("uk-UA")+" грн";

    $("totalDeliveries").textContent =
    deliveries;

}



// ========================================
// HISTORY
// ========================================

function renderHistory(){

    const container =
    $("historyContainer");

    if(!container) return;


    container.innerHTML="";


    if(!state.history.length){

        container.innerHTML=`

        <div class="empty-card">

        📜 Історія порожня

        </div>

        `;

        return;

    }


    state.history
    .slice(0,50)
    .forEach(item=>{


        container.innerHTML += `

        <div class="history-card">

        <h3>
        👤 ${item.worker}
        </h3>

        <p>
        💰 ${(item.salary||0)
        .toLocaleString("uk-UA")} грн
        </p>

        <p>
        📦 Здано продукції:
        ${
        (item.alcohol2||0)+
        (item.alcohol3||0)+
        (item.parsley2||0)+
        (item.parsley3||0)
        }
        </p>

        </div>

        `;


    });

}
// ========================================
// ADD WORKER
// ========================================

$("addWorkerBtn")?.addEventListener(
"click",
async()=>{


    const name =
    $("newWorker").value.trim();


    if(!name){

        toast("Введіть нік працівника");

        return;

    }


    if(state.workers[name]){

        toast("❌ Такий працівник вже існує");

        return;

    }


    await set(
    ref(db,"workers/"+name),
    {

        money:0,

        products:0,

        deliveries:0,

        alcohol2:0,

        alcohol3:0,

        parsley2:0,

        parsley3:0

    });


    $("newWorker").value="";


    toast("✅ Працівника додано");


});
// ========================================
// SAVE PRICES
// ========================================

$("savePricesBtn")?.addEventListener(
"click",
async()=>{


    if(!state.owner){

        // тимчасово дозволяємо після входу
    }


    const prices = {


        alcohol2:
        Number($("priceAlcohol2").value) || 900,


        alcohol3:
        Number($("priceAlcohol3").value) || 1200,


        parsley2:
        Number($("priceParsley2").value) || 800,


        parsley3:
        Number($("priceParsley3").value) || 1100


    };


    await set(
    ref(db,"prices"),
    prices
    );


    state.prices = prices;


    toast("💰 Ціни збережено");


});
// ========================================
// CLEAR HISTORY
// ========================================

$("clearHistoryBtn")?.addEventListener(
"click",
async()=>{


    if(!confirm("Очистити всю історію?"))
    return;


    await remove(
    ref(db,"history")
    );


    toast("🗑 Історію очищено");


});
// ========================================
// CLEAR TOP
// ========================================

$("clearTopBtn")?.addEventListener(
"click",
async()=>{


    if(!confirm("Очистити ТОП працівників?"))
    return;


    const updates={};


    Object.keys(state.workers)
    .forEach(name=>{


        updates[name+"/money"]=0;


    });


    await update(
    ref(db,"workers"),
    updates
    );


    toast("🏆 ТОП очищено");


});
// ========================================
// WORKER PROFILE
// ========================================

function renderProfile(name){

    const container =
    $("profileContainer");


    if(!container) return;


    const worker =
    state.workers[name];


    if(!worker){

        container.innerHTML="";

        return;

    }


    container.innerHTML = `

    <div class="profile-card">

        <h2>
        👤 ${name}
        </h2>


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
        ${(worker.money || 0)
        .toLocaleString("uk-UA")} грн
        </p>


        <p>
        📈 Кількість здач:
        ${worker.deliveries || 0}
        </p>


    </div>

    `;


}
// ========================================
// SEARCH WORKER
// ========================================

$("searchWorkerBtn")?.addEventListener(
"click",
()=>{


    const name =
    $("searchWorker").value.trim();


    if(!name){

        toast("Введіть нік");

        return;

    }


    if(!state.workers[name]){

        toast("❌ Працівника не знайдено");

        return;

    }


    state.selectedWorker=name;


    renderProfile(name);


});
// ========================================
// DELETE WORKER
// ========================================

$("deleteWorkerBtn")?.addEventListener(
"click",
async()=>{


    const name =
    state.selectedWorker;


    if(!name){

        toast("Оберіть працівника");

        return;

    }


    if(!confirm(
    `Видалити ${name}?`
    )) return;


    await remove(
    ref(db,"workers/"+name)
    );


    state.selectedWorker=null;


    $("profileContainer").innerHTML="";


    toast("🗑 Працівника видалено");


});
// ========================================
// TOP PLAYERS
// ========================================

function renderTop(){

    const container =
    $("topContainer");


    if(!container) return;


    container.innerHTML="";


    const workers =

    Object.entries(state.workers)

    .sort((a,b)=>

    (b[1].earned||0)
    -
    (a[1].earned||0)

    )
    .slice(0,10);



    if(!workers.length){

        container.innerHTML=
        `
        <div class="empty-card">
        🏆 ТОП порожній
        </div>
        `;

        return;

    }



    workers.forEach(

    ([name,data],index)=>{


        let place;


        if(index===0)
        place="🥇";

        else if(index===1)
        place="🥈";

        else if(index===2)
        place="🥉";

        else
        place=`#${index+1}`;



        container.innerHTML += `

        <div class="top-card">

            <div class="top-place">
            ${place}
            </div>


            <div>

            <h3>
            ${name}
            </h3>


            <p>
            💰 
           (data.earned||0)
            .toLocaleString("uk-UA")}
            грн
            </p>


            <p>
            📦 ${data.products||0}
            продукції
            </p>

            </div>

        </div>

        `;


    });


}
// ========================================
// TOGGLE WORKERS TABLE
// ========================================

$("toggleWorkersBtn")?.addEventListener(
"click",
()=>{

    const table =
    $("workersTable");


    if(!table) return;


    if(table.style.display==="none"
    ||
    table.style.display===""){

        table.style.display="block";

        $("toggleWorkersBtn").innerHTML =
        "🔼 Сховати працівників";

    }
    else{

        table.style.display="none";

        $("toggleWorkersBtn").innerHTML =
        "👥 Показати працівників";

    }

});
// ========================================
// OWNER WORKERS LIST
// ========================================

function renderOwnerWorkers(){

    const box =
    $("workersTable");


    if(!box) return;


    box.innerHTML="";


    Object.entries(state.workers)
    .forEach(([name,data])=>{


        box.innerHTML += `

        <div class="worker-row">


            <h3>
            👤 ${name}
            </h3>


            <p>
            💰 ${(data.money||0)
            .toLocaleString("uk-UA")} грн
            </p>


            <button
            class="gold-btn"
            onclick="selectWorker('${name}')">

            📂 Відкрити

            </button>


        </div>

        `;


    });

}
// ========================================
// OWNER WORKERS TABLE
// ========================================

window.renderOwnerWorkers = function(){

    const box = $("workersTable");

    if(!box) return;


    box.innerHTML = "";


    Object.entries(state.workers)
    .forEach(([name,data])=>{


        box.innerHTML += `

        <div class="worker-row">

            <h3>
            👤 ${name}
            </h3>


            <p>
            💰 ${(data.money||0)
            .toLocaleString("uk-UA")} грн
            </p>


            <button
            class="gold-btn"
            onclick="selectWorker('${name}')">

            📂 Відкрити

            </button>

        </div>

        `;


    });


};



// ========================================
// SHOW / HIDE TABLE
// ========================================

$("toggleWorkersBtn")?.addEventListener(
"click",
()=>{

    const table =
    $("workersTable");


    if(!table) return;


    if(table.style.display==="none"){

        table.style.display="block";

        $("toggleWorkersBtn").innerHTML =
        "🔼 Сховати працівників";

    }
    else{

        table.style.display="none";

        $("toggleWorkersBtn").innerHTML =
        "👥 Показати працівників";

    }

});
setTimeout(()=>{

    if(typeof renderOwnerWorkers === "function"){

        renderOwnerWorkers();

    }

},1000);
// ========================================
// OWNER LOGIN
// ========================================

const OWNER_PASSWORD = "1234";

document.getElementById("ownerLoginBtn")?.addEventListener("click", () => {

    const password =
        document.getElementById("ownerPassword").value;

    if (password !== OWNER_PASSWORD) {

        alert("❌ Невірний пароль");

        return;

    }

    document.getElementById("ownerLogin").style.display = "none";

    document.getElementById("ownerPanel").style.display = "block";

});
// ========================================
// OWNER WORKERS TABLE
// ========================================

const toggleWorkersTable =
document.getElementById("toggleWorkersTable");

if(toggleWorkersTable){

    toggleWorkersTable.onclick = ()=>{

        const box =
        document.getElementById("workersTableBox");

        box.style.display =

        box.style.display==="none"
        ? "block"
        : "none";

        renderWorkersTable();

    };

}

function renderWorkersTable(){

    const body =
    document.getElementById("workersTableBody");

    if(!body) return;

    body.innerHTML="";
    
   console.log(Object.entries(state.workers));

Object.entries(state.workers).forEach(
    
    ([name,data])=>{

        body.innerHTML += `

        <tr>

            <td>${name}</td>

            <td>${data.code||"-"}</td>

          <td>${(data.earned||0).toLocaleString("uk-UA")} грн</td>

            <td>${data.products||0}</td>

            <td>${data.deliveries||0}</td>

            <td>

                <button
                class="small-btn"
                onclick="editWorker('${name}')">

                ✏️

                </button>

                <button
                class="small-btn delete-btn"
                onclick="deleteWorker('${name}')">

                🗑️

                </button>

            </td>

        </tr>

        `;

    });

}
