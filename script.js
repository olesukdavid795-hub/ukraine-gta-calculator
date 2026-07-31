// ========================================
// REVENANT v3
// SCRIPT.JS
// FIREBASE SETUP
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

    authDomain:
    "revenant-v2-955dc.firebaseapp.com",

    databaseURL:
    "https://revenant-v2-955dc-default-rtdb.firebaseio.com",

    projectId:
    "revenant-v2-955dc",

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

const state = {


    workers:{},


    history:{},


    prices:{


        alcohol2:900,


        alcohol3:1200,


        parsley2:800,


        parsley3:1100


    }

};



// ========================================
// DOM ELEMENTS
// ========================================

const loader =
document.getElementById("loader");


const toast =
document.getElementById("toast");



const workerNickname =
document.getElementById("workerNickname");


const alcohol2 =
document.getElementById("alcohol2");


const alcohol3 =
document.getElementById("alcohol3");


const parsley2 =
document.getElementById("parsley2");


const parsley3 =
document.getElementById("parsley3");


const salary =
document.getElementById("salary");


const calculateBtn =
document.getElementById("calculateBtn");


const saveBtn =
document.getElementById("saveBtn");


const calculatorMessage =
document.getElementById("calculatorMessage");
// ========================================
// NAVIGATION
// ========================================

window.showPage = function(pageId){


    document
    .querySelectorAll(".page")
    .forEach(page=>{

        page.classList.remove(
            "active-page"
        );

    });



    const page =
    document.getElementById(pageId);



    if(page){

        page.classList.add(
            "active-page"
        );

    }



    document
    .querySelectorAll(".menu-btn")
    .forEach(btn=>{

        btn.classList.remove(
            "active"
        );

    });



    if(event){

        event.target.classList.add(
            "active"
        );

    }

};



// ========================================
// TOAST
// ========================================

function showToast(
    text,
    type="gold"
){

    if(!toast) return;


    toast.innerHTML = text;


    toast.classList.add(
        "show"
    );


    setTimeout(()=>{


        toast.classList.remove(
            "show"
        );


    },3000);

}



// ========================================
// LOADER
// ========================================

function showLoader(){

    if(loader){

        loader.classList.remove(
            "hidden"
        );

    }

}



function hideLoader(){

    if(loader){

        loader.classList.add(
            "hidden"
        );

    }

}
// ========================================
// CHECK WORKER
// ========================================

async function checkWorkerExists(nickname){


    if(!nickname){

        return false;

    }



    const snapshot =
    await get(
        ref(db,"workers")
    );



    if(!snapshot.exists()){

        return false;

    }



    const workers =
    snapshot.val();



    return Object.keys(workers)
    .some(name=>

        name.toLowerCase()
        ===
        nickname.toLowerCase()

    );


}



// ========================================
// CALCULATE SALARY
// ========================================


let currentSalary = 0;



calculateBtn.addEventListener(
"click",
async ()=>{


    const nickname =
    workerNickname.value.trim();



    if(!nickname){


        showToast(
            "❌ Введіть нік працівника"
        );


        return;

    }



    const exists =
    await checkWorkerExists(
        nickname
    );



    if(!exists){


        salary.innerHTML =
        "0 грн";



        calculatorMessage.innerHTML =
        "❌ Працівника не знайдено!";



        saveBtn.disabled = true;



        showToast(
            "Працівника не знайдено"
        );


        return;

    }



    currentSalary =

        Number(alcohol2.value)
        *
        state.prices.alcohol2

        +

        Number(alcohol3.value)
        *
        state.prices.alcohol3

        +

        Number(parsley2.value)
        *
        state.prices.parsley2

        +

        Number(parsley3.value)
        *
        state.prices.parsley3;



    salary.innerHTML =

    currentSalary
    .toLocaleString()
    +
    " грн";



    calculatorMessage.innerHTML =

    "✅ Працівника знайдено";



    saveBtn.disabled = false;



    showToast(
        "✅ Розрахунок готовий"
    );


});
// ========================================
// SAVE DELIVERY
// ========================================

saveBtn.addEventListener(
"click",
async ()=>{


    const nickname =
    workerNickname.value.trim();



    if(!nickname || currentSalary <= 0){


        showToast(
            "❌ Спочатку зробіть розрахунок"
        );


        return;

    }



    const workerRef =
    ref(
        db,
        "workers/" + nickname
    );



    const workerSnap =
    await get(workerRef);



    if(!workerSnap.exists()){


        showToast(
            "❌ Працівника не знайдено"
        );


        return;

    }



    const worker =
    workerSnap.val();



    const delivery = {


        nickname,


        alcohol2:
        Number(alcohol2.value),


        alcohol3:
        Number(alcohol3.value),


        parsley2:
        Number(parsley2.value),


        parsley3:
        Number(parsley3.value),


        salary:
        currentSalary,


        date:
        new Date()
        .toLocaleString(
            "uk-UA"
        )

    };



    // ============================
    // SAVE HISTORY
    // ============================


    await push(

        ref(
            db,
            "history"
        ),

        delivery

    );



    // ============================
    // UPDATE WORKER
    // ============================


    const updatedWorker = {


        ...worker,


        money:
        (worker.money || 0)
        +
        currentSalary,


        deliveries:
        (worker.deliveries || 0)
        +
        1,


        alcohol2:
        (worker.alcohol2 || 0)
        +
        delivery.alcohol2,


        alcohol3:
        (worker.alcohol3 || 0)
        +
        delivery.alcohol3,


        parsley2:
        (worker.parsley2 || 0)
        +
        delivery.parsley2,


        parsley3:
        (worker.parsley3 || 0)
        +
        delivery.parsley3

    };



    await set(

        workerRef,

        updatedWorker

    );



    showToast(
        "✅ Здача збережена"
    );



    // ============================
    // CLEAR CALCULATOR
    // ============================


    workerNickname.value = "";

    alcohol2.value = 0;

    alcohol3.value = 0;

    parsley2.value = 0;

    parsley3.value = 0;


    salary.innerHTML =
    "0 грн";


    calculatorMessage.innerHTML =
    "";


    currentSalary = 0;


});
// ========================================
// OWNER ACCESS
// ========================================

const OWNER_PASSWORD = "DaniilChorni015327";


let ownerMode = false;



const ownerLoginBtn =
document.getElementById("ownerLoginBtn");


const ownerPassword =
document.getElementById("ownerPassword");


const ownerContent =
document.getElementById("ownerContent");



if(ownerLoginBtn){


ownerLoginBtn.addEventListener(
"click",
()=>{


    if(
        ownerPassword.value
        ===
        OWNER_PASSWORD
    ){


        ownerMode = true;


        ownerContent.style.display =
        "block";


        showToast(
            "👑 Вхід власника успішний"
        );


        ownerPassword.value = "";


    }
    else{


        showToast(
            "❌ Невірний пароль"
        );


    }


});


}
// ========================================
// WORKERS
// ========================================


const workersTable =
document.getElementById("workersTable");


const addWorkerBtn =
document.getElementById("addWorkerBtn");



const searchWorker =
document.getElementById("searchWorker");



// ========================================
// RENDER WORKERS
// ========================================

function renderWorkers(list = state.workers){


    if(!workersTable) return;


    workersTable.innerHTML = "";



    Object.entries(list)
    .forEach(([name,worker])=>{


        const tr =
        document.createElement("tr");



        tr.innerHTML = `

        <td>
        ${name}
        </td>


        <td>
        ${(worker.money || 0)
        .toLocaleString()}
        грн
        </td>


        <td>
        ${
        (worker.alcohol2 || 0)
        +
        (worker.alcohol3 || 0)
        +
        (worker.parsley2 || 0)
        +
        (worker.parsley3 || 0)
        }
        </td>


        <td>
        ${worker.deliveries || 0}
        </td>


        <td>

        <button
        class="danger-btn"
        onclick="deleteWorker('${name}')">

        🗑

        </button>

        </td>


        `;



        workersTable.appendChild(tr);



    });



}



// ========================================
// ADD WORKER
// ========================================

if(addWorkerBtn){


addWorkerBtn.addEventListener(
"click",
async ()=>{


    if(!ownerMode){


        showToast(
            "👑 Доступ тільки для власника"
        );


        return;

    }



    const name =
    prompt(
        "Введіть нік працівника:"
    );



    if(!name) return;



    await set(

        ref(
            db,
            "workers/" + name
        ),

        {


            money:0,


            deliveries:0,


            alcohol2:0,


            alcohol3:0,


            parsley2:0,


            parsley3:0


        }

    );



    showToast(
        "✅ Працівника додано"
    );


});


}



// ========================================
// DELETE WORKER
// ========================================

window.deleteWorker =
async function(name){


    if(!ownerMode){


        showToast(
            "👑 Тільки власник"
        );


        return;

    }



    await remove(

        ref(
            db,
            "workers/" + name
        )

    );


    showToast(
        "🗑 Працівника видалено"
    );


};



// ========================================
// SEARCH
// ========================================

if(searchWorker){


searchWorker.addEventListener(
"input",
()=>{


    const text =
    searchWorker.value
    .toLowerCase();



    const filtered = {};



    Object.entries(state.workers)
    .forEach(([name,data])=>{


        if(
            name
            .toLowerCase()
            .includes(text)
        ){

            filtered[name]=data;

        }


    });



    renderWorkers(filtered);



});


}
// ========================================
// FIREBASE LISTENERS
// ========================================


function startListeners(){



// ============================
// WORKERS
// ============================

onValue(

    ref(db,"workers"),

    snapshot=>{


        state.workers =
        snapshot.exists()
        ?
        snapshot.val()
        :
        {};


        renderWorkers(
            state.workers
        );


        renderStatistics();


    }

);




// ============================
// HISTORY
// ============================

onValue(

    ref(db,"history"),

    snapshot=>{


        state.history =
        snapshot.exists()
        ?
        snapshot.val()
        :
        {};


        renderHistory();


    }

);




// ============================
// PRICES
// ============================

onValue(

    ref(db,"prices"),

    snapshot=>{


        if(snapshot.exists()){


            state.prices =
            {

                ...state.prices,

                ...snapshot.val()

            };


        }


    }

);



}



// ========================================
// START APP
// ========================================

startListeners();
// ========================================
// STATISTICS
// ========================================


function renderStatistics(){



const workersCount =
document.getElementById(
"workersCount"
);



const totalMoney =
document.getElementById(
"totalMoney"
);



const totalProducts =
document.getElementById(
"totalProducts"
);



const totalDeliveries =
document.getElementById(
"totalDeliveries"
);



const topWorkers =
document.getElementById(
"topWorkers"
);



if(!workersCount) return;



let money = 0;

let products = 0;

let deliveries = 0;



const array =
Object.entries(
state.workers
);




array.forEach(
([name,worker])=>{


    money +=
    worker.money || 0;



    products +=

    (worker.alcohol2 || 0)
    +
    (worker.alcohol3 || 0)
    +
    (worker.parsley2 || 0)
    +
    (worker.parsley3 || 0);



    deliveries +=
    worker.deliveries || 0;


});





workersCount.innerHTML =
array.length;



totalMoney.innerHTML =

money
.toLocaleString()
+
" грн";



totalProducts.innerHTML =
products;



totalDeliveries.innerHTML =
deliveries;





// ============================
// TOP
// ============================


if(topWorkers){


    const top =

    array

    .sort(
    (a,b)=>

        (b[1].money || 0)
        -
        (a[1].money || 0)

    )

    .slice(0,5);



    topWorkers.innerHTML = "";



    top.forEach(
    ([name,worker],index)=>{


        topWorkers.innerHTML += `

        <div class="history-card">

        🏆 ${index+1} місце

        <br>

        👤 ${name}

        <br>

        💰
        ${(worker.money || 0)
        .toLocaleString()}
        грн

        </div>

        `;


    });


}


}
// ========================================
// HISTORY
// ========================================


const historyList =
document.getElementById(
"historyList"
);



const searchHistory =
document.getElementById(
"searchHistory"
);



const clearHistoryBtn =
document.getElementById(
"clearHistoryBtn"
);




// ========================================
// RENDER HISTORY
// ========================================


function renderHistory(list = state.history){



    if(!historyList) return;



    historyList.innerHTML = "";



    Object.values(list)

    .reverse()

    .forEach(item=>{


        historyList.innerHTML += `


        <div class="history-card">


        👤 ${item.nickname}


        <br>


        🍾 ⭐⭐ :
        ${item.alcohol2 || 0}


        <br>


        🍾 ⭐⭐⭐ :
        ${item.alcohol3 || 0}


        <br>


        🌿 ⭐⭐ :
        ${item.parsley2 || 0}


        <br>


        🌿 ⭐⭐⭐ :
        ${item.parsley3 || 0}


        <br>


        💰

        ${(item.salary || 0)
        .toLocaleString()}

        грн


        <br>


        📅 ${item.date || ""}


        </div>


        `;


    });


}




// ========================================
// SEARCH HISTORY
// ========================================


if(searchHistory){


searchHistory.addEventListener(
"input",
()=>{


    const text =

    searchHistory.value
    .toLowerCase();



    const filtered = {};



    Object.entries(
        state.history
    )

    .forEach(([id,item])=>{


        if(

        item.nickname
        .toLowerCase()
        .includes(text)

        ){

            filtered[id]=item;

        }


    });



    renderHistory(
        filtered
    );


});


}




// ========================================
// CLEAR HISTORY
// ========================================


if(clearHistoryBtn){


clearHistoryBtn.addEventListener(
"click",
async ()=>{


    if(!ownerMode){


        showToast(
            "👑 Тільки власник"
        );


        return;

    }



    await remove(

        ref(
            db,
            "history"
        )

    );



    showToast(
        "🗑 Історію очищено"
    );


});


}
// ========================================
// OWNER PRICES
// ========================================


const savePricesBtn =
document.getElementById(
"savePricesBtn"
);


const priceAlcohol2 =
document.getElementById(
"priceAlcohol2"
);


const priceAlcohol3 =
document.getElementById(
"priceAlcohol3"
);


const priceParsley2 =
document.getElementById(
"priceParsley2"
);


const priceParsley3 =
document.getElementById(
"priceParsley3"
);




// ========================================
// LOAD PRICES TO INPUTS
// ========================================


function loadPrices(){


    if(!priceAlcohol2)
    return;



    priceAlcohol2.value =
    state.prices.alcohol2;



    priceAlcohol3.value =
    state.prices.alcohol3;



    priceParsley2.value =
    state.prices.parsley2;



    priceParsley3.value =
    state.prices.parsley3;


}




// ========================================
// SAVE PRICES
// ========================================


if(savePricesBtn){


savePricesBtn.addEventListener(
"click",
async ()=>{


    if(!ownerMode){


        showToast(
            "👑 Тільки власник"
        );


        return;

    }



    const prices = {


        alcohol2:
        Number(
            priceAlcohol2.value
        ),


        alcohol3:
        Number(
            priceAlcohol3.value
        ),


        parsley2:
        Number(
            priceParsley2.value
        ),


        parsley3:
        Number(
            priceParsley3.value
        )


    };



    await set(

        ref(
            db,
            "prices"
        ),

        prices

    );



    state.prices =
    prices;



    showToast(
        "💰 Ціни збережено"
    );


});


}
// ========================================
// OWNER PRICES
// ========================================


const savePricesBtn =
document.getElementById(
"savePricesBtn"
);


const priceAlcohol2 =
document.getElementById(
"priceAlcohol2"
);


const priceAlcohol3 =
document.getElementById(
"priceAlcohol3"
);


const priceParsley2 =
document.getElementById(
"priceParsley2"
);


const priceParsley3 =
document.getElementById(
"priceParsley3"
);




// ========================================
// LOAD PRICES TO INPUTS
// ========================================


function loadPrices(){


    if(!priceAlcohol2)
    return;



    priceAlcohol2.value =
    state.prices.alcohol2;



    priceAlcohol3.value =
    state.prices.alcohol3;



    priceParsley2.value =
    state.prices.parsley2;



    priceParsley3.value =
    state.prices.parsley3;


}




// ========================================
// SAVE PRICES
// ========================================


if(savePricesBtn){


savePricesBtn.addEventListener(
"click",
async ()=>{


    if(!ownerMode){


        showToast(
            "👑 Тільки власник"
        );


        return;

    }



    const prices = {


        alcohol2:
        Number(
            priceAlcohol2.value
        ),


        alcohol3:
        Number(
            priceAlcohol3.value
        ),


        parsley2:
        Number(
            priceParsley2.value
        ),


        parsley3:
        Number(
            priceParsley3.value
        )


    };



    await set(

        ref(
            db,
            "prices"
        ),

        prices

    );



    state.prices =
    prices;



    showToast(
        "💰 Ціни збережено"
    );


});


}
