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
// TOP
// ========================================

function renderTop(){

    const container =
    $("topContainer");

    if(!container) return;

    container.innerHTML="";

    const workers=

    Object.entries(state.workers)

    .sort((a,b)=>

    (b[1].money||0)-
    (a[1].money||0)

    )

    .slice(0,10);

    if(!workers.length){

        container.innerHTML=

        `<div class="empty-card">

        🏆 ТОП порожній

        </div>`;

        return;

    }

    workers.forEach(

    ([name,data],index)=>{

        container.innerHTML+=`

        <div class="top-card">

        <h2>

        #${index+1}

        </h2>

        <h3>${name}</h3>

        <p>

        💰 ${

        (data.money||0)

        .toLocaleString("uk-UA")

        } грн

        </p>

        </div>

        `;

    });

}
