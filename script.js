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
