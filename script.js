/* =====================================
   REVENANT v2 ULTIMATE
   SCRIPT.JS
   PART 1
===================================== */


// ===============================
// FIREBASE IMPORTS
// ===============================


import { initializeApp } from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {

getDatabase,
ref,
set,
get,
push,
remove,
onValue

}

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";





// ===============================
// FIREBASE CONFIG
// ===============================


// СЮДИ ВСТАВЛЯЄМО ТВОЇ ДАНІ FIREBASE


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





// ===============================
// GLOBAL STATE
// ===============================


const state = {


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





console.log(
"🔥 Revenant v2 Ultimate запущено"
);
/* =====================================
   PART 2
   NAVIGATION + TOAST + OWNER LOGIN
===================================== */



// ===============================
// NAVIGATION
// ===============================


const navButtons =
document.querySelectorAll(".nav-btn");


const pages =
document.querySelectorAll(".page");



navButtons.forEach(btn=>{


btn.addEventListener(
"click",
()=>{


const target =
btn.dataset.page;



navButtons.forEach(b=>

b.classList.remove("active")

);



btn.classList.add("active");



pages.forEach(page=>{


page.classList.remove("active");



if(page.id===target){

page.classList.add("active");

}


});


});


});






// ===============================
// TOAST
// ===============================


window.showToast = function(message){


const toast =
document.getElementById("toast");



toast.innerText = message;


toast.classList.add("show");



setTimeout(()=>{


toast.classList.remove("show");


},3000);



};







// ===============================
// OWNER LOGIN
// ===============================



const OWNER_PASSWORD =
"RV-ULTIMATE-2026-OWNER";



const ownerLoginBtn =
document.getElementById(
"ownerLoginBtn"
);



if(ownerLoginBtn){


ownerLoginBtn.addEventListener(
"click",
()=>{


const input =
document.getElementById(
"ownerPassword"
);



if(
input.value === OWNER_PASSWORD
){


state.owner = true;



document.getElementById(
"ownerLogin"
).style.display="none";



document.getElementById(
"ownerPanel"
).style.display="block";



showToast(
"👑 Панель власника відкрита"
);



}else{


showToast(
"❌ Неправильний пароль"
);



}



});


}
/* =====================================
   PART 3
   WORKERS SYSTEM
===================================== */



// ===============================
// GENERATE WORKER CODE
// ===============================


function generateWorkerCode(){


const number =
Math.floor(
100000 +
Math.random()*900000
);



return "RV-" + number;


}







// ===============================
// ADD WORKER
// ===============================


const addWorkerBtn =
document.getElementById(
"addWorkerBtn"
);



if(addWorkerBtn){


addWorkerBtn.addEventListener(
"click",
async()=>{


const input =
document.getElementById(
"newWorkerName"
);



const name =
input.value.trim();



if(!name){


showToast(
"❌ Введіть нік працівника"
);


return;


}




// перевірка чи існує


const snapshot =
await get(
ref(db,"workers")
);



let workers =
snapshot.exists()
?
snapshot.val()
:
{};



for(const id in workers){


if(
workers[id].name
.toLowerCase()
===
name.toLowerCase()

){


showToast(
"❌ Такий працівник вже існує"
);


return;


}


}




const id =
push(
ref(db,"workers")
).key;



const worker = {


name:name,


code:
generateWorkerCode(),


alcohol2:0,


alcohol3:0,


parsley2:0,


parsley3:0,


totalProducts:0,


money:0,


deliveries:0,


created:
Date.now()


};





await set(
ref(db,"workers/"+id),
worker
);



input.value="";



showToast(
"✅ Працівника додано"
);



});


}
/* =====================================
   PART 4
   LOAD WORKERS + SEARCH + PROFILE
===================================== */



// ===============================
// LOAD WORKERS
// ===============================


function loadWorkers(){


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



}


);


}







// ===============================
// RENDER WORKERS
// ===============================


function renderWorkers(){


const box =
document.getElementById(
"workersList"
);



if(!box) return;



box.innerHTML="";



Object.entries(
state.workers
)
.forEach(
([id,worker])=>{



const div =
document.createElement(
"div"
);



div.className =
"worker-item";



div.innerHTML = `


<div class="worker-info">

<h3>
${worker.name}
</h3>

<p class="worker-code">

${worker.code}

</p>

</div>



<div>


<button 
class="btn"
onclick="
openWorkerProfile('${id}')
">

👤

</button>



<button
class="btn danger"
onclick="
deleteWorker('${id}')
">

❌

</button>


</div>


`;



box.appendChild(div);



});


}







// ===============================
// SEARCH WORKER
// ===============================


const searchInput =
document.getElementById(
"workerSearch"
);



if(searchInput){


searchInput.addEventListener(
"input",
()=>{


const value =
searchInput.value
.toLowerCase();



const box =
document.getElementById(
"workersList"
);



box.innerHTML="";



Object.entries(
state.workers
)

.filter(
([id,w])=>

w.name
.toLowerCase()
.includes(value)

||

w.code
.toLowerCase()
.includes(value)

)


.forEach(
([id,worker])=>{


const div =
document.createElement(
"div"
);



div.className =
"worker-item";



div.innerHTML = `

<div>

<h3>
${worker.name}
</h3>

<p>
${worker.code}
</p>

</div>


<button
class="btn"
onclick="
openWorkerProfile('${id}')
">

👤 Профіль

</button>

`;



box.appendChild(div);


});


});


}







// ===============================
// OPEN PROFILE
// ===============================


window.openWorkerProfile =
function(id){


const worker =
state.workers[id];



if(!worker)return;



state.selectedWorker=id;



const box =
document.getElementById(
"workerProfile"
);



box.innerHTML = `


<div class="profile-grid">


<div class="profile-box">

<h4>
👤 Нік
</h4>

<strong>
${worker.name}
</strong>

</div>



<div class="profile-box">

<h4>
🆔 Код
</h4>

<strong>
${worker.code}
</strong>

</div>



<div class="profile-box">

<h4>
📦 Продукція
</h4>

<strong>
${worker.totalProducts}
</strong>

</div>



<div class="profile-box">

<h4>
💰 Зароблено
</h4>

<strong>
${worker.money} грн
</strong>

</div>



<div class="profile-box">

<h4>
📈 Здачі
</h4>

<strong>
${worker.deliveries}
</strong>

</div>


</div>


`;



};
/* =====================================
   PART 5
   DELETE WORKER CONFIRMATION
===================================== */



let deleteWorkerId = null;





// ===============================
// OPEN CONFIRM MODAL
// ===============================


function openConfirm(
title,
text,
callback
){


const modal =
document.getElementById(
"confirmModal"
);



document.getElementById(
"confirmTitle"
).innerText =
title;



document.getElementById(
"confirmText"
).innerText =
text;



modal.classList.add(
"show"
);



deleteWorkerId =
callback;



}







// ===============================
// CANCEL
// ===============================


const cancelBtn =
document.getElementById(
"confirmCancel"
);



if(cancelBtn){


cancelBtn.onclick =
()=>{


document
.getElementById(
"confirmModal"
)
.classList.remove(
"show"
);



deleteWorkerId=null;


};


}







// ===============================
// ACCEPT
// ===============================


const acceptBtn =
document.getElementById(
"confirmAccept"
);



if(acceptBtn){


acceptBtn.onclick =
async()=>{


if(deleteWorkerId){


await deleteWorkerId();



showToast(
"🗑 Видалено"
);



}



document
.getElementById(
"confirmModal"
)
.classList.remove(
"show"
);



deleteWorkerId=null;


};


}







// ===============================
// DELETE WORKER
// ===============================


window.deleteWorker =
function(id){


const worker =
state.workers[id];



if(!worker)return;



openConfirm(

"⚠️ Видалення працівника",

`
Видалити ${worker.name}?

Будуть видалені:
• профіль
• статистика
• дані працівника

Цю дію не можна скасувати.
`,

async()=>{


await remove(
ref(db,"workers/"+id)
);



}

);


};
/* =====================================
   PART 6
   PRICES SYSTEM
===================================== */



// ===============================
// LOAD PRICES
// ===============================


function loadPrices(){


onValue(

ref(db,"prices"),

snapshot=>{


if(snapshot.exists()){


state.prices =
snapshot.val();


}



fillPriceInputs();


}


);


}







// ===============================
// FILL OWNER INPUTS
// ===============================


function fillPriceInputs(){



const a2 =
document.getElementById(
"priceAlcohol2"
);


const a3 =
document.getElementById(
"priceAlcohol3"
);


const p2 =
document.getElementById(
"priceParsley2"
);


const p3 =
document.getElementById(
"priceParsley3"
);




if(a2)
a2.value =
state.prices.alcohol2;


if(a3)
a3.value =
state.prices.alcohol3;


if(p2)
p2.value =
state.prices.parsley2;


if(p3)
p3.value =
state.prices.parsley3;


}







// ===============================
// SAVE PRICES
// ===============================


const savePricesBtn =
document.getElementById(
"savePricesBtn"
);



if(savePricesBtn){


savePricesBtn.onclick =
async()=>{



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




showToast(
"💰 Ціни збережено"
);



};


}



/* =====================================
   PART 8
   TOP + HISTORY
===================================== */



// ===============================
// RENDER TOP
// ===============================


function renderTop(){


const box =
document.getElementById(
"topWorkers"
);



if(!box)return;



box.innerHTML="";



const workers =

Object.values(
state.workers
);



workers.sort(
(a,b)=>

b.totalProducts -
a.totalProducts

);





workers
.slice(0,10)
.forEach(
(worker,index)=>{



const div =
document.createElement(
"div"
);



div.className =
"top-card";



div.innerHTML = `


<div class="rank">

${index+1}

</div>



<div>

<h3>

${worker.name}

</h3>


<p>

📦 ${worker.totalProducts}

</p>


<p>

💰 ${worker.money} грн

</p>


</div>


`;



box.appendChild(div);



});


}







// ===============================
// LOAD HISTORY
// ===============================


function loadHistory(){


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


}







// ===============================
// RENDER HISTORY
// ===============================


function renderHistory(){


const box =
document.getElementById(
"historyList"
);



if(!box)return;



box.innerHTML="";




Object.values(
state.history
)

.reverse()

.slice(0,100)

.forEach(
(item)=>{



const div =
document.createElement(
"div"
);



div.className =
"history-card";



div.innerHTML = `


<div>

<h3>

👤 ${item.worker}

</h3>


<p>

🆔 ${item.code}

</p>


<p>

📅 ${item.date}

</p>


</div>



<div>


<p>
🍺 ⭐⭐ ${item.alcohol2}
</p>


<p>
🍺 ⭐⭐⭐ ${item.alcohol3}
</p>


<p>
🌿 ⭐⭐ ${item.parsley2}
</p>


<p>
🌿 ⭐⭐⭐ ${item.parsley3}
</p>


<strong>

💰 ${item.money} грн

</strong>


</div>


`;



box.appendChild(div);



});


}
/* =====================================
   START SYSTEM
===================================== */


loadWorkers();

loadPrices();

loadHistory();
/* =====================================
   PART 9
   STATISTICS
===================================== */


function renderStatistics(){


const box =
document.getElementById(
"statisticsBox"
);


if(!box) return;



let workersCount =
Object.keys(state.workers).length;


let products = 0;

let money = 0;

let deliveries = 0;



Object.values(
state.workers
)
.forEach(worker=>{


products +=
worker.totalProducts || 0;


money +=
worker.money || 0;


deliveries +=
worker.deliveries || 0;


});



/* =====================================
   PART 9
   STATISTICS
===================================== */







box.innerHTML = `


<div class="stat-card">


<h3>
👷 Працівників
</h3>


<strong>
${workersCount}
</strong>


</div>



<div class="stat-card">


<h3>
📦 Продукція
</h3>


<strong>
${products}
</strong>


</div>



<div class="stat-card">


<h3>
📈 Здач
</h3>


<strong>
${deliveries}
</strong>


</div>



<div class="stat-card">


<h3>
💰 Виплачено
</h3>


<strong>
${money} грн
</strong>


</div>


`;



}






// ===============================
// UPDATE LISTENERS
// ===============================


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

renderTop();

renderStatistics();



}

);
/* =====================================
   PART 10
   CLEAR HISTORY + CLEAR TOP
===================================== */



// ===============================
// CLEAR HISTORY
// ===============================


const clearHistoryBtn =
document.getElementById(
"clearHistoryBtn"
);



if(clearHistoryBtn){


clearHistoryBtn.onclick = ()=>{


openConfirm(

"⚠️ Очистити історію",

"Вся історія здач буде видалена. Цю дію не можна скасувати.",


async()=>{


await remove(
ref(db,"history")
);



showToast(
"🗑 Історію очищено"
);


}


);


};


}







// ===============================
// CLEAR TOP
// ===============================


const clearTopBtn =
document.getElementById(
"clearTopBtn"
);



if(clearTopBtn){


clearTopBtn.onclick = ()=>{


openConfirm(

"⚠️ Очистити ТОП",

"Рейтинг буде очищено. Дані працівників залишаться.",


async()=>{


// ТОП будується з workers,
// тому тут просто оновлюємо рейтинг


renderTop();



showToast(
"🏆 ТОП оновлено"
);



}


);


};


}
