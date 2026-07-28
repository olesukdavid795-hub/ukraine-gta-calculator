/* =========================================
   REVENANT v2
   PREMIUM SALARY CALCULATOR
========================================= */

"use strict";


const CONFIG = {

    ownerPassword: "revenant_owner",

    limits: {

        alcohol2: 900,

        alcohol3: 1200,

        parsley2: 800,

        parsley3: 1100

    }

};



let prices = JSON.parse(
    localStorage.getItem("revenant_prices")
) || {

    alcohol2:900,

    alcohol3:1200,

    parsley2:800,

    parsley3:1100

};



let history = JSON.parse(
    localStorage.getItem("revenant_history")
) || [];



let players = JSON.parse(
    localStorage.getItem("revenant_players")
) || [];



/* ==============================
   SAVE
============================== */


function saveAll(){

    localStorage.setItem(
        "revenant_prices",
        JSON.stringify(prices)
    );


    localStorage.setItem(
        "revenant_history",
        JSON.stringify(history)
    );


    localStorage.setItem(
        "revenant_players",
        JSON.stringify(players)
    );

}



/* ==============================
   TOAST
============================== */


function toast(message,type="success"){

    const box =
    document.createElement("div");


    box.className =
    "toast " + type;


    box.innerHTML =
    message;


    document.body.appendChild(box);



    setTimeout(()=>{

        box.classList.add("show");

    },50);



    setTimeout(()=>{

        box.remove();

    },3000);

}




/* ==============================
   CALCULATOR
============================== */


function calculate(){


    const alcohol2 =
    Number(
        document.querySelector("#alcohol2")?.value || 0
    );


    const alcohol3 =
    Number(
        document.querySelector("#alcohol3")?.value || 0
    );


    const parsley2 =
    Number(
        document.querySelector("#parsley2")?.value || 0
    );


    const parsley3 =
    Number(
        document.querySelector("#parsley3")?.value || 0
    );



    const total =

    alcohol2 * prices.alcohol2 +

    alcohol3 * prices.alcohol3 +

    parsley2 * prices.parsley2 +

    parsley3 * prices.parsley3;



    const result =
    document.querySelector("#total");


    if(result){

        result.textContent =
        total.toLocaleString("uk-UA")
        + " грн";

    }



    return total;

}



/* ==============================
   ADD PLAYER HISTORY
============================== */


function saveSalary()// очищення калькулятора після збереження

document.querySelector("#alcohol2").value = 0;

document.querySelector("#alcohol3").value = 0;

document.querySelector("#parsley2").value = 0;

document.querySelector("#parsley3").value = 0;

document.querySelector("#playerName").value = "";


calculate();


toast(
"Калькулятор очищено",
"success"
);{


const name =
document.querySelector("#playerName")?.value.trim();



if(!name){

toast(
"Введіть нік гравця",
"error"
);

return;

}



const total =
calculate();



if(total<=0){

toast(
"Немає даних",
"error"
);

return;

}



history.unshift({

    player:name,

    amount:total,

    date:
    new Date()
    .toLocaleString("uk-UA")

});




let player =
players.find(
p=>p.name===name
);



if(!player){

player={

name,

total:0,

count:0

};


players.push(player);

}



player.total += total;

player.count++;



saveAll();



renderHistory();

renderTop();



toast(
"Зарплату збережено"
);



}



/* ==============================
   HISTORY
============================== */


function renderHistory(){


const box =
document.querySelector("#history");


if(!box) return;


box.innerHTML="";


history.forEach(item=>{


box.innerHTML += `

<div class="historyItem">

<b>${item.player}</b>

<br>

${item.amount.toLocaleString("uk-UA")} грн

<br>

<small>${item.date}</small>

</div>

`;


});


}




/* ==============================
   TOP 3
============================== */


function renderTop(){

    const box = document.querySelector("#topPlayers");

    if(!box) return;


    if(players.length === 0){

        box.innerHTML = `
        <div class="top">
        Даних ще немає
        </div>
        `;

        return;

    }


    let top = [...players]
    .sort((a,b)=>b.total-a.total)
    .slice(0,3);



    box.innerHTML = "";



    top.forEach((p,index)=>{


        let medal = "";

        if(index === 0) medal = "🥇";
        if(index === 1) medal = "🥈";
        if(index === 2) medal = "🥉";



        box.innerHTML += `

        <div class="top">

        ${medal} ${index+1} місце

        <br>

        <b>${p.name}</b>

        <br>

        💰 ${p.total.toLocaleString("uk-UA")} грн

        </div>

        `;


    });


}


const box =
document.querySelector("#topPlayers");


if(!box) return;



let top =
[...players]
.sort(
(a,b)=>b.total-a.total
)
.slice(0,3);



box.innerHTML="";



top.forEach((p,index)=>{


box.innerHTML += `

<div class="top">

${index+1} місце 🏆

<b>${p.name}</b>

<br>

${p.total.toLocaleString("uk-UA")} грн

</div>

`;

});


}




/* ==============================
   OWNER PANEL
============================== */


function ownerLogin(){


const pass =
document.querySelector("#ownerPass")
?.value;



if(pass!==CONFIG.ownerPassword){

toast(
"Невірний пароль",
"error"
);

return;

}



document.querySelector("#ownerPanel")
.classList.remove("hidden");


toast(
"Панель власника відкрита"
);


}



function updatePrices(){



prices.alcohol2 =
Number(
document.querySelector("#priceAlcohol2").value
);


prices.alcohol3 =
Number(
document.querySelector("#priceAlcohol3").value
);


prices.parsley2 =
Number(
document.querySelector("#priceParsley2").value
);


prices.parsley3 =
Number(
document.querySelector("#priceParsley3").value
);



saveAll();



toast(
"Ціни оновлено"
);


}



/* ==============================
   EXPORT PDF BUTTON
============================== */


function exportPDF(){


window.print();


}



/* ==============================
   EVENTS
============================== */


document.addEventListener(
"input",
()=>{

calculate();

});



document.addEventListener(
"click",
e=>{


if(e.target.id==="saveSalary")

saveSalary();



if(e.target.id==="ownerLogin")

ownerLogin();



if(e.target.id==="savePrices")

updatePrices();



if(e.target.id==="pdfExport")

exportPDF();



});



window.onload=()=>{


renderHistory();


renderTop();


calculate();


// оновлення даних кожні 3 секунди

setInterval(()=>{

renderHistory();

renderTop();

},3000);


}


renderHistory();

renderTop();

calculate();


};
