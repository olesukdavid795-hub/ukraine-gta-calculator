// ========================================
// REVENANT v3
// SCRIPT.JS
// ========================================

// ========================================
// FIREBASE
// ========================================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getDatabase,
    ref,
    get,
    set,
    push,
    remove,
    onValue
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ========================================
// FIREBASE CONFIG
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
// GLOBAL STATE
// ========================================

const state = {

    workers:{},

    history:{},

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
// ELEMENTS
// ========================================

const calculatorPage = document.getElementById("calculatorPage");
const statisticsPage = document.getElementById("statisticsPage");
const historyPage = document.getElementById("historyPage");
const ownerPage = document.getElementById("ownerPage");

const workerNickname = document.getElementById("workerNickname");

const alcohol2 = document.getElementById("alcohol2");
const alcohol3 = document.getElementById("alcohol3");
const parsley2 = document.getElementById("parsley2");
const parsley3 = document.getElementById("parsley3");

const salary = document.getElementById("salary");

const calculateBtn = document.getElementById("calculateBtn");
const saveBtn = document.getElementById("saveBtn");

const calculatorMessage =
document.getElementById("calculatorMessage");

const toast =
document.getElementById("toast");

const loader =
document.getElementById("loader");

// Тимчасово блокуємо кнопку збереження
saveBtn.disabled = true;
// ========================================
// NAVIGATION
// ========================================

const pages = [

    calculatorPage,

    statisticsPage,

    historyPage,

    ownerPage

];

window.showPage = function(pageId){

    pages.forEach(page=>{

        page.classList.remove("active-page");

    });

    document
    .getElementById(pageId)
    .classList
    .add("active-page");

    document
    .querySelectorAll(".nav-btn")
    .forEach(btn=>{

        btn.classList.remove("active");

    });

    event?.target
    ?.closest(".nav-btn")
    ?.classList
    .add("active");

};
// ========================================
// TOAST
// ========================================

function showToast(text,color="#d4af37"){

    toast.innerHTML = text;

    toast.style.borderLeftColor = color;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}
// ========================================
// CHECK WORKER
// ========================================

async function checkWorkerExists(nickname){

    const name = nickname.trim();

    if(name === ""){

        return false;

    }

    const snapshot = await get(
        ref(db,"workers")
    );

    if(!snapshot.exists()){

        return false;

    }

    const workers = snapshot.val();

    return Object.keys(workers).some(workerName =>
        workerName.toLowerCase() === name.toLowerCase()
    );

}
// ========================================
// CALCULATE
// ========================================

calculateBtn.addEventListener("click", async ()=>{

    const nickname = workerNickname.value.trim();

    if(nickname === ""){

        showToast(
            "Введіть нік працівника",
            "#ff4b4b"
        );

        return;

    }

    const exists =
    await checkWorkerExists(nickname);

    if(!exists){

        salary.innerHTML = "0 грн";

        calculatorMessage.innerHTML =
        "❌ Працівника не знайдено!";

        saveBtn.disabled = true;

        showToast(
            "Працівника не знайдено",
            "#ff4b4b"
        );

        return;

    }

    calculatorMessage.innerHTML =
    "✅ Працівника знайдено";

    saveBtn.disabled = false;

    const total =

    Number(alcohol2.value) *
    state.prices.alcohol2 +

    Number(alcohol3.value) *
    state.prices.alcohol3 +

    Number(parsley2.value) *
    state.prices.parsley2 +

    Number(parsley3.value) *
    state.prices.parsley3;

    salary.innerHTML =
    total.toLocaleString() + " грн";

    showToast("Розрахунок готовий");

});
// ========================================
// SAVE DELIVERY
// ========================================

saveBtn.addEventListener("click", async ()=>{

    const nickname = workerNickname.value.trim();

    const exists = await checkWorkerExists(nickname);

    if(!exists){

        showToast(
            "Працівника не знайдено",
            "#ff4b4b"
        );

        return;

    }

    const total =

        Number(alcohol2.value) * state.prices.alcohol2 +

        Number(alcohol3.value) * state.prices.alcohol3 +

        Number(parsley2.value) * state.prices.parsley2 +

        Number(parsley3.value) * state.prices.parsley3;

    const delivery = {

        worker:nickname,

        alcohol2:Number(alcohol2.value),

        alcohol3:Number(alcohol3.value),

        parsley2:Number(parsley2.value),

        parsley3:Number(parsley3.value),

        salary:total,

        date:new Date().toLocaleString("uk-UA")

    };

    showLoader();

    try{
        
await push(
    ref(db,"history"),
    delivery
);

await updateWorkerStatistics(delivery);

showToast(
    "✅ Здачу успішно збережено",
    "#42d96b"
);

        workerNickname.value="";

        alcohol2.value=0;
        alcohol3.value=0;
        parsley2.value=0;
        parsley3.value=0;

        salary.innerHTML="0 грн";

        calculatorMessage.innerHTML="";

        saveBtn.disabled=true;

    }

    catch(error){

        console.error(error);

        showToast(
            "Помилка збереження",
            "#ff4b4b"
        );

    }

    finally{

        hideLoader();

    }

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
// START
// ========================================

startListeners();
