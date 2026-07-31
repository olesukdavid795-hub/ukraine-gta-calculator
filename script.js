// ========================================
// REVENANT v3
// PREMIUM MAFIA GOLD
// SCRIPT.JS
// PART 1
// FIREBASE SETUP
// ========================================


import {

initializeApp

}

from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";



import {

getDatabase,
ref,
set,
get,
push,
remove,
onValue

}

from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";




// ========================================
// FIREBASE CONFIG
// ========================================


const firebaseConfig = {


apiKey:
"AIzaSyB-rv0vO2ZN_BYhraPNBIKhvTahrtEB9D8",


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





const app =
initializeApp(firebaseConfig);



const db =
getDatabase(app);






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


currentSalary:0


};






// ========================================
// DOM
// ========================================


const $ = id =>
document.getElementById(id);



const salary =
$("salary");


const workerNickname =
$("workerNickname");


const alcohol2 =
$("alcohol2");


const alcohol3 =
$("alcohol3");


const parsley2 =
$("parsley2");


const parsley3 =
$("parsley3");


const calculateBtn =
$("calculateBtn");


const saveBtn =
$("saveBtn");


const calculatorMessage =
$("calculatorMessage");



console.log(
"👑 REVENANT v3 STARTED"
);
// ========================================
// PART 2
// NAVIGATION + UI
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



    if(event && event.target){


        event.target.classList.add(
            "active"
        );


    }


};





// ========================================
// TOAST
// ========================================


function toast(message){


    const box =
    $("toast");


    if(!box)
    return;



    box.innerHTML =
    message;



    box.classList.add(
        "show"
    );



    setTimeout(()=>{


        box.classList.remove(
            "show"
        );


    },3000);


}






// ========================================
// LOADER
// ========================================


function showLoader(){


    const loader =
    $("loader");


    if(loader)

    loader.classList.remove(
        "hidden"
    );


}





function hideLoader(){


    const loader =
    $("loader");


    if(loader)

    loader.classList.add(
        "hidden"
    );


}
// ========================================
// PART 3
// OWNER SYSTEM
// ========================================


const OWNER_PASSWORD =
"DaniilChorni015327";



const ownerLoginBtn =
$("ownerLoginBtn");


const ownerPassword =
$("ownerPassword");


const ownerContent =
$("ownerContent");





// ========================================
// OWNER LOGIN
// ========================================


if(ownerLoginBtn){


ownerLoginBtn.addEventListener(
"click",
()=>{


    if(
        ownerPassword.value
        ===
        OWNER_PASSWORD
    ){


        state.owner = true;



        if(ownerContent){

            ownerContent.style.display =
            "block";

        }



        toast(
            "👑 Вхід власника успішний"
        );



        ownerPassword.value="";


    }

    else{


        toast(
            "❌ Невірний пароль"
        );


    }


});


}





// ========================================
// CHECK OWNER
// ========================================


function checkOwner(){


    if(!state.owner){


        toast(
            "👑 Доступ тільки власнику"
        );


        return false;


    }



    return true;


}
// ========================================
// PART 4
// WORKERS SYSTEM
// ========================================



const addWorkerBtn =
$("addWorkerBtn");



// ========================================
// RENDER WORKERS
// ========================================


function renderWorkers(){


    const box =
    $("workersList");


    if(!box)
    return;



    box.innerHTML = "";



    Object.entries(
        state.workers
    )
    .forEach(([name,worker])=>{


        box.innerHTML += `


        <div class="history-card">


        👤 ${name}

        <br>


        💰 ${(worker.money || 0)
        .toLocaleString()} грн


        <br>


        📦 Продукція:

        ${(worker.products || 0)}


        <br>


        📈 Здач:

        ${worker.deliveries || 0}


        <br><br>


        <button

        class="danger-btn"

        onclick="deleteWorker('${name}')">

        🗑 Видалити

        </button>


        </div>


        `;


    });



}







// ========================================
// ADD WORKER
// ========================================


if(addWorkerBtn){


addWorkerBtn.addEventListener(
"click",
async ()=>{


    if(!checkOwner())
    return;




    const name =
    prompt(
        "Введіть нік працівника"
    );



    if(!name)
    return;




    const exists =
    await get(
        ref(
            db,
            "workers/"+name
        )
    );



    if(exists.exists()){


        toast(
            "❌ Такий працівник вже є"
        );


        return;

    }






    await set(

        ref(
            db,
            "workers/"+name
        ),


        {


        money:0,


        products:0,


        deliveries:0,


        alcohol2:0,


        alcohol3:0,


        parsley2:0,


        parsley3:0



        }


    );




    toast(
        "✅ Працівника додано"
    );



});


}







// ========================================
// DELETE WORKER
// ========================================


window.deleteWorker =
async function(name){



    if(!checkOwner())
    return;



    await remove(

        ref(
            db,
            "workers/"+name
        )

    );



    toast(
        "🗑 Працівника видалено"
    );


};
// ========================================
// PART 5
// CALCULATOR
// ========================================



// ========================================
// CHECK WORKER
// ========================================


async function findWorker(name){


    const snap =
    await get(
        ref(db,"workers/"+name)
    );


    return snap.exists()
    ?
    snap.val()
    :
    null;


}






// ========================================
// CALCULATE
// ========================================


if(calculateBtn){


calculateBtn.addEventListener(
"click",
async ()=>{


    const nickname =
    workerNickname.value.trim();



    if(!nickname){


        toast(
            "❌ Введіть нік"
        );


        return;

    }




    const worker =
    await findWorker(
        nickname
    );




    if(!worker){


        salary.innerHTML =
        "0 грн";


        calculatorMessage.innerHTML =
        "❌ Працівника не знайдено";


        toast(
            "Працівника немає в базі"
        );


        return;


    }






    state.currentSalary =


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

    state.currentSalary
    .toLocaleString()
    +
    " грн";




    calculatorMessage.innerHTML =

    "✅ Працівник знайдений";



    toast(
        "🧮 Розрахунок готовий"
    );


});


}






// ========================================
// SAVE DELIVERY
// ========================================


if(saveBtn){


saveBtn.addEventListener(
"click",
async ()=>{



    const nickname =
    workerNickname.value.trim();




    if(!state.currentSalary){


        toast(
            "❌ Спочатку зробіть розрахунок"
        );


        return;


    }




    const worker =
    await findWorker(
        nickname
    );



    if(!worker){


        toast(
            "❌ Працівника не знайдено"
        );


        return;


    }





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
        state.currentSalary,


        date:
        new Date()
        .toLocaleString("uk-UA")


    };





    await push(

        ref(
            db,
            "history"
        ),


        delivery

    );







    await set(

        ref(
            db,
            "workers/"+nickname
        ),


        {


        ...worker,


        money:
        (worker.money || 0)
        +
        state.currentSalary,


        deliveries:
        (worker.deliveries || 0)
        +
        1,


        products:
        (worker.products || 0)
        +
        Number(alcohol2.value)
        +
        Number(alcohol3.value)
        +
        Number(parsley2.value)
        +
        Number(parsley3.value)



        }


    );





    toast(
        "✅ Здача збережена"
    );



    workerNickname.value="";

    alcohol2.value=0;

    alcohol3.value=0;

    parsley2.value=0;

    parsley3.value=0;


    salary.innerHTML =
    "0 грн";


    state.currentSalary=0;


});


}
// ========================================
// PART 6
// STATISTICS + HISTORY + TOP
// ========================================





// ========================================
// STATISTICS
// ========================================


function renderStatistics(){


    const workersCount =
    $("workersCount");


    const totalMoney =
    $("totalMoney");


    const totalProducts =
    $("totalProducts");


    const totalDeliveries =
    $("totalDeliveries");



    if(!workersCount)
    return;




    let money = 0;

    let products = 0;

    let deliveries = 0;



    Object.values(
        state.workers
    )
    .forEach(worker=>{


        money +=
        worker.money || 0;


        products +=
        worker.products || 0;


        deliveries +=
        worker.deliveries || 0;


    });





    workersCount.innerHTML =
    Object.keys(
        state.workers
    ).length;




    totalMoney.innerHTML =

    money
    .toLocaleString()
    +
    " грн";



    totalProducts.innerHTML =
    products;



    totalDeliveries.innerHTML =
    deliveries;


}






// ========================================
// HISTORY
// ========================================


function renderHistory(){



    const box =
    $("historyList");


    if(!box)
    return;



    box.innerHTML="";



    Object.values(
        state.history
    )
    .reverse()
    .forEach(item=>{



        box.innerHTML += `


        <div class="history-card">


        👤 ${item.nickname}


        <br>


        🍾 ⭐⭐:
        ${item.alcohol2 || 0}


        <br>


        🍾 ⭐⭐⭐:
        ${item.alcohol3 || 0}


        <br>


        🌿 ⭐⭐:
        ${item.parsley2 || 0}


        <br>


        🌿 ⭐⭐⭐:
        ${item.parsley3 || 0}


        <br><br>


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
// TOP
// ========================================


function renderTop(){


    const box =
    $("topWorkers");


    if(!box)
    return;




    box.innerHTML="";



    const top =

    Object.entries(
        state.workers
    )

    .sort(
        (a,b)=>

        (b[1].money || 0)

        -

        (a[1].money || 0)

    )

    .slice(0,5);





    top.forEach(
    ([name,worker],index)=>{


        box.innerHTML += `


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
// ========================================
// PART 7
// FIREBASE LISTENERS + OWNER ACTIONS
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



    renderWorkers();


    renderStatistics();


    renderTop();



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


        state.prices = {


            ...state.prices,


            ...snapshot.val()


        };


    }


}



);



}







// ========================================
// SAVE PRICES
// ========================================


const savePricesBtn =
$("savePricesBtn");



if(savePricesBtn){


savePricesBtn.addEventListener(
"click",
async ()=>{


    if(!checkOwner())
    return;



    const prices = {


        alcohol2:

        Number(
        $("priceAlcohol2").value
        ),



        alcohol3:

        Number(
        $("priceAlcohol3").value
        ),



        parsley2:

        Number(
        $("priceParsley2").value
        ),



        parsley3:

        Number(
        $("priceParsley3").value
        )



    };




    await set(

    ref(db,"prices"),

    prices

    );




    toast(
        "💰 Ціни збережено"
    );



});


}







// ========================================
// CLEAR HISTORY
// ========================================


const clearHistoryBtn =
$("clearHistoryBtn");



if(clearHistoryBtn){


clearHistoryBtn.addEventListener(
"click",
async ()=>{


    if(!checkOwner())
    return;



    await remove(
        ref(db,"history")
    );



    toast(
        "📜 Історію очищено"
    );


});


}






// ========================================
// CLEAR TOP
// ========================================


const clearTopBtn =
$("clearTopBtn");



if(clearTopBtn){


clearTopBtn.addEventListener(
"click",
async ()=>{


    if(!checkOwner())
    return;



    const updates = {};



    Object.keys(
        state.workers
    )
    .forEach(name=>{


        updates[name+"/money"] = 0;


    });





    await set(

        ref(db,"workers"),

        {

        ...state.workers,

        }


    );



    toast(
        "🏆 ТОП очищено"
    );


});


}






// START

startListeners();


hideLoader();

