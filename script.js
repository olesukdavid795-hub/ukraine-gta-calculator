// ========================================
// REVENANT v2
// SCRIPT.JS
// FIREBASE SETUP
// ========================================


import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";


import {

getDatabase,
ref,
onValue,
set,
push,
remove,
get

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
  appId: "1:888954510701:web:84dc99929d5b82ee564e64",
  measurementId: "G-6T8KDGQFXR"
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
// PAGE NAVIGATION
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


};







// ========================================
// FIREBASE LOADERS
// ========================================



function startListeners(){



// WORKERS

onValue(
    ref(db,"workers"),
    snapshot=>{


        state.workers =
        snapshot.exists()
        ?
        snapshot.val()
        :
        {};


        renderStatistics();

        renderTop();


    }

);






// PRICES

onValue(
    ref(db,"prices"),
    snapshot=>{


        if(snapshot.exists()){


            state.prices =
            snapshot.val();


        }


    }

);







// HISTORY


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


        renderStatistics();


    }

);



}





startListeners();
// ========================================
// CALCULATOR
// ========================================



const calculateBtn =
document.getElementById("calculateBtn");


const saveBtn =
document.getElementById("saveBtn");





function getCalculatorData(){


return {


nickname:
document.getElementById(
"workerNickname"
).value.trim(),



alcohol2:
Number(
document.getElementById(
"alcohol2"
).value
),



alcohol3:
Number(
document.getElementById(
"alcohol3"
).value
),



parsley2:
Number(
document.getElementById(
"parsley2"
).value
),



parsley3:
Number(
document.getElementById(
"parsley3"
).value
)


};


}








calculateBtn.onclick = function(){



const data =
getCalculatorData();



const message =
document.getElementById(
"calculatorMessage"
);




if(
!state.workers[data.nickname]
){


message.innerHTML =
"❌ Працівника не знайдено!<br>Зверніться до власника.";


document.getElementById(
"salary"
).innerHTML =
"0 грн";


return;


}






const salary =


data.alcohol2 *
state.prices.alcohol2



+

data.alcohol3 *
state.prices.alcohol3



+

data.parsley2 *
state.prices.parsley2



+

data.parsley3 *
state.prices.parsley3;





document.getElementById(
"salary"
).innerHTML =


salary.toLocaleString()
+
" грн";



message.innerHTML =
"✅ Розрахунок готовий";



};







saveBtn.onclick = async function(){



const data =
getCalculatorData();



if(
!state.workers[data.nickname]
){


document.getElementById(
"calculatorMessage"
).innerHTML =


"❌ Неможливо зберегти. Працівника не знайдено!";


return;


}






const salary =


data.alcohol2 *
state.prices.alcohol2



+

data.alcohol3 *
state.prices.alcohol3



+

data.parsley2 *
state.prices.parsley2



+

data.parsley3 *
state.prices.parsley3;






await push(
ref(db,"history"),
{


nickname:data.nickname,


alcohol2:data.alcohol2,


alcohol3:data.alcohol3,


parsley2:data.parsley2,


parsley3:data.parsley3,


salary:salary,


date:
new Date()
.toLocaleString("uk-UA")


}


);






document.getElementById(
"calculatorMessage"
).innerHTML =


"✅ Здача збережена";



};
// ========================================
// STATISTICS
// ========================================


function renderStatistics(){



const workers =
Object.values(
state.workers
);



let products = 0;

let money = 0;

let deliveries =
Object.keys(
state.history
).length;





workers.forEach(worker=>{


products +=

Number(worker.alcohol2 || 0)

+

Number(worker.alcohol3 || 0)

+

Number(worker.parsley2 || 0)

+

Number(worker.parsley3 || 0);



money +=
Number(
worker.money || 0
);



});






document.getElementById(
"statWorkers"
).innerHTML =

workers.length;





document.getElementById(
"statProducts"
).innerHTML =

products;





document.getElementById(
"statMoney"
).innerHTML =

money.toLocaleString()
+
" грн";





document.getElementById(
"statDeliveries"
).innerHTML =

deliveries;



}









// ========================================
// TOP WORKERS
// ========================================


function renderTop(){



const box =
document.getElementById(
"topWorkers"
);



if(!box) return;



box.innerHTML = "";




let list = [];





Object.entries(
state.workers
)
.forEach(
([name,worker])=>{


let total =

Number(worker.alcohol2 || 0)

+

Number(worker.alcohol3 || 0)

+

Number(worker.parsley2 || 0)

+

Number(worker.parsley3 || 0);



list.push({


name:name,


total:total,


money:
Number(worker.money || 0)


});


});







list.sort(
(a,b)=>

b.total - a.total

);







list
.slice(0,10)
.forEach(
(worker,index)=>{



box.innerHTML += `


<div>


🏆 ${index+1} місце

<br>


👤 ${worker.name}


<br>


📦 ${worker.total}

<br>


💰 ${worker.money.toLocaleString()} грн


</div>


`;



});



}
// ========================================
// HISTORY
// ========================================


function renderHistory(){



const box =
document.getElementById(
"historyList"
);



if(!box) return;



box.innerHTML = "";





Object.values(
state.history
)
.reverse()
.forEach(item=>{



box.innerHTML += `


<div>


👤 ${item.nickname}

<br>


📦

⭐⭐ ${item.alcohol2}

|

⭐⭐⭐ ${item.alcohol3}


<br>


🌿

⭐⭐ ${item.parsley2}

|

⭐⭐⭐ ${item.parsley3}


<br>


💰 ${item.salary.toLocaleString()} грн


<br>


📅 ${item.date}


</div>


`;



});



}









// ========================================
// OWNER LOGIN
// ========================================



const ownerLoginBtn =
document.getElementById(
"ownerLoginBtn"
);




ownerLoginBtn.onclick =
function(){



const password =

document.getElementById(
"ownerPassword"
).value;





if(password === "1234"){



document.getElementById(
"ownerPanel"
).style.display =
"block";



document.getElementById(
"ownerLoginBox"
).style.display =
"none";



}

else{


document.getElementById(
"ownerMessage"
).innerHTML =

"❌ Невірний пароль";


}


};
// ========================================
// OWNER FUNCTIONS
// ========================================



const addWorkerBtn =
document.getElementById(
"addWorkerBtn"
);



addWorkerBtn.onclick =
async function(){



const name =

document.getElementById(
"newWorkerName"
).value.trim();





if(!name){

return;

}




await set(

ref(
db,
"workers/" + name
),

{


alcohol2:0,

alcohol3:0,

parsley2:0,

parsley3:0,

money:0


}

);





document.getElementById(
"newWorkerName"
).value = "";



};









// ========================================
// SAVE PRICES
// ========================================



const savePricesBtn =

document.getElementById(
"savePricesBtn"
);




savePricesBtn.onclick =
async function(){



state.prices.alcohol2 =

Number(
document.getElementById(
"priceAlcohol2"
).value
);



state.prices.alcohol3 =

Number(
document.getElementById(
"priceAlcohol3"
).value
);



state.prices.parsley2 =

Number(
document.getElementById(
"priceParsley2"
).value
);



state.prices.parsley3 =

Number(
document.getElementById(
"priceParsley3"
).value
);





await set(

ref(db,"prices"),

state.prices

);




};









// ========================================
// CLEAR HISTORY
// ========================================



const clearHistoryBtn =

document.getElementById(
"clearHistoryBtn"
);




clearHistoryBtn.onclick =
async function(){


await remove(
ref(db,"history")
);


};









// ========================================
// CLEAR TOP
// ========================================



const clearTopBtn =

document.getElementById(
"clearTopBtn"
);




clearTopBtn.onclick =
async function(){



await remove(
ref(db,"workers")
);



};
