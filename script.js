/* =========================================================
   Revenant v2
   Premium Mafia Edition
   script.js
========================================================= */

"use strict";

/* ===========================
   CONFIG
=========================== */

const CONFIG = {
    ownerPassword: "revenant_owner",
    version: "2.0",
    animation: 250
};

/* ===========================
   STATE
=========================== */

const State = {
    owner: false,
    users: [],
    logs: [],
    settings: {
        darkMode: true,
        sounds: true,
        blur: true
    }
};

/* ===========================
   HELPERS
=========================== */

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function load(key, fallback) {
    const data = localStorage.getItem(key);

    if (!data) return fallback;

    try {
        return JSON.parse(data);
    } catch {
        return fallback;
    }
}

function createID() {
    return crypto.randomUUID();
}

function formatTime() {
    return new Date().toLocaleString("uk-UA");
}

/* ===========================
   TOAST
=========================== */

function toast(text, type = "info") {

    const box = $("#toastContainer");

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.innerHTML = `
        <div class="toastIcon"></div>
        <div class="toastText">${text}</div>
    `;

    box.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");
    }, 30);

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 3000);

}

/* ===========================
   LOG SYSTEM
=========================== */

function addLog(action) {

    State.logs.unshift({

        id: createID(),

        action,

        date: formatTime()

    });

    save("revenant_logs", State.logs);

    renderLogs();

}

/* ===========================
   USERS
=========================== */

function renderUsers() {

    const table = $("#ownerUsers");

    if (!table) return;

    table.innerHTML = "";

    State.users.forEach(user => {

        table.innerHTML += `
        <tr>

            <td>${user.name}</td>

            <td>${user.role}</td>

            <td>${user.created}</td>

            <td>

                <button class="btnDelete"
                    data-id="${user.id}">
                    Видалити
                </button>

            </td>

        </tr>
        `;

    });

}

function createUser(name, role) {

    const permissions = {

        Admin: [
            "users",
            "logs",
            "settings"
        ],

        Moderator: [
            "users"
        ],

        Player: []

    };


    State.users.push({

        id: createID(),

        name,

        role,

        permissions:
        permissions[role],

        created:
        formatTime()

    });


    save(
        "revenant_users",
        State.users
    );


    renderUsers();


    addLog(
        `Створено ${role}: ${name}`
    );


    toast(
        `${role} створено`,
        "success"
    );

}

    State.users.push({

        id: createID(),

        name,

        role,

        created: formatTime()

    });

    save("revenant_users", State.users);

    renderUsers();

    addLog(`Створено користувача ${name}`);

    toast("Користувача створено", "success");

}

function deleteUser(id) {

    State.users =
        State.users.filter(x => x.id !== id);

    save("revenant_users", State.users);

    renderUsers();

    addLog("Користувача видалено");

    toast("Видалено", "error");

}

/* ===========================
   LOG RENDER
=========================== */

function renderLogs() {

    const block = $("#ownerLogs");

    if (!block) return;

    block.innerHTML = "";

    State.logs.forEach(log => {

        block.innerHTML += `

        <div class="log">

            <span>${log.action}</span>

            <small>${log.date}</small>

        </div>

        `;

    });

}

/* ===========================
   OWNER LOGIN
=========================== */

function ownerLogin(){


const pass =
$("#ownerPassword").value;



if(pass !== CONFIG.ownerPassword){


toast(
"Невірний пароль",
"error"
);


return;

}



$("#loginLoader")
.classList
.remove("hidden");



setTimeout(()=>{


State.owner = true;



$("#ownerLogin")
.classList
.add("hidden");



$("#ownerPanel")
.classList
.remove("hidden");



$("#loginLoader")
.classList
.add("hidden");



toast(
"Owner Mode активовано",
"success"
);



addLog(
"Вхід власника"
);



},1200);


}

    const pass = $("#ownerPassword").value;

    if (pass !== CONFIG.ownerPassword) {

        toast("Невірний пароль", "error");

        return;

    }

    State.owner = true;

    $("#ownerLogin").classList.add("hidden");

    $("#ownerPanel").classList.remove("hidden");

    toast("Owner Mode активовано", "success");

    addLog("Вхід власника");

}

function ownerLogout() {

    State.owner = false;

    $("#ownerPanel").classList.add("hidden");

    $("#ownerLogin").classList.remove("hidden");

    $("#ownerPassword").value = "";

    toast("Вихід виконано");

}

/* ===========================
   OWNER DASHBOARD
=========================== */

function updateDashboard() {

    $("#statUsers").textContent =
        State.users.length;

    $("#statLogs").textContent =
        State.logs.length;

    $("#statVersion").textContent =
        CONFIG.version;

}

/* ===========================
   SETTINGS
=========================== */

function loadSettings() {

    State.settings =
        load("revenant_settings", State.settings);

}

function saveSettings() {

    save("revenant_settings", State.settings);

}

function toggleDark() {

    State.settings.darkMode =
        !State.settings.darkMode;

    document.body.classList.toggle(
        "light",
        !State.settings.darkMode
    );

    saveSettings();

}

function toggleBlur() {

    State.settings.blur =
        !State.settings.blur;

    document.body.classList.toggle(
        "blurOff",
        !State.settings.blur
    );

    saveSettings();

}

/* ===========================
   EVENTS
=========================== */

document.addEventListener("click", e => {

    if (e.target.id === "ownerLoginBtn") {

        ownerLogin();

    }

    if (e.target.id === "logoutOwner") {

        ownerLogout();

    }

    if (e.target.id === "createUserBtn") {

        const name =
            $("#newUserName").value.trim();

        const role =
            $("#newUserRole").value;

        if (!name) {

            toast("Введіть ім'я", "warning");

            return;

        }

        createUser(name, role);

        $("#newUserName").value = "";

    }

    if (e.target.classList.contains("btnDelete")) {

        deleteUser(
            e.target.dataset.id
        );

    }

    if (e.target.id === "toggleDark") {

        toggleDark();

    }

    if (e.target.id === "toggleBlur") {

        toggleBlur();

    }

});

/* ===========================
   INIT
=========================== */

window.addEventListener("DOMContentLoaded", () => {

    State.users =
        load("revenant_users", []);

    State.logs =
        load("revenant_logs", []);

    loadSettings();

    renderUsers();

    renderLogs();

    updateDashboard();

});
/* =================================
   PREMIUM UI EFFECTS
================================= */


/* CARD ANIMATION */

document.querySelectorAll(".card, .ownerBox, .stat")
.forEach((element,index)=>{

    element.style.opacity="0";

    element.style.transform=
    "translateY(25px)";

    setTimeout(()=>{

        element.style.transition=
        "0.6s ease";

        element.style.opacity="1";

        element.style.transform=
        "translateY(0)";


    },index*120);


});



/* BUTTON SOUND EFFECT */

document.addEventListener(
"click",
(e)=>{


if(
e.target.tagName==="BUTTON"
&&
State.settings.sounds
){

const audio=
new Audio(
"data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAA"
);

audio.volume=0.05;

audio.play()
.catch(()=>{});


}


});



/* LIVE CLOCK */

function liveClock(){

let clock=
document.querySelector("#liveClock");


if(!clock) return;


clock.textContent =
new Date()
.toLocaleTimeString(
"uk-UA"
);


}


setInterval(
liveClock,
1000
);



/* SECURITY */

document.addEventListener(
"contextmenu",
e=>{

if(State.owner){

e.preventDefault();

toast(
"Owner режим захищено",
"warning"
);

}

});


/* AUTO SAVE */

setInterval(()=>{

save(
"revenant_users",
State.users
);


save(
"revenant_logs",
State.logs
);


save(
"revenant_settings",
State.settings
);


},5000);
/* =================================
   ROLE SYSTEM
================================= */


function checkPermission(permission){

    const owner = State.owner;


    if(owner){

        return true;

    }


    const user =
    State.currentUser;


    if(!user){

        return false;

    }


    return user.permissions
    .includes(permission);

}



function openSection(section){


    if(
    !checkPermission(section)
    ){

        toast(
        "Недостатньо прав доступу",
        "error"
        );

        return;

    }


    toast(
    `Відкрито ${section}`,
    "success"
    );


}
/* =================================
   MAFIA RANK SYSTEM
================================= */


const RankSystem = {


getRank(xp){


    if(xp >= 10000)
        return "👑 Don";


    if(xp >= 5000)
        return "🔥 Boss";


    if(xp >= 2500)
        return "💎 Capo";


    if(xp >= 1000)
        return "⚔ Veteran";


    if(xp >= 500)
        return "🕶 Member";


    return "🔰 Novice";


},



getLevel(xp){

    return Math.floor(
        xp / 500
    ) + 1;

}


};



State.player =
load(
"revenant_player",
{

xp:0,

name:"Unknown"

}

);



function updateProfile(){


const xp =
State.player.xp;



const rank =
RankSystem.getRank(xp);



const level =
RankSystem.getLevel(xp);



const rankEl =
document.querySelector(
"#playerRank"
);



const levelEl =
document.querySelector(
"#playerLevel"
);



const xpEl =
document.querySelector(
"#playerXP"
);



if(rankEl)
rankEl.textContent = rank;



if(levelEl)
levelEl.textContent = level;



if(xpEl)
xpEl.textContent = xp;



save(
"revenant_player",
State.player
);


}




document.addEventListener(
"click",
e=>{


if(
e.target.id==="addXP"
){

State.player.xp += 100;


updateProfile();


addLog(
"+100 XP отримано"
);


toast(
"XP додано",
"success"
);


}


});



window.addEventListener(
"DOMContentLoaded",
()=>{

updateProfile();

});
/* =================================
   MAFIA STATS SYSTEM
================================= */


State.mafia =
load(
"revenant_mafia",
{

money:5000,

respect:0,

crimes:0,

faction:"Без фракції"

}

);



function updateMafiaStats(){


const data =
State.mafia;



$("#money").textContent =
data.money.toLocaleString("uk-UA") + " ₴";


$("#respect").textContent =
data.respect;


$("#crimes").textContent =
data.crimes;


$("#faction").textContent =
data.faction;



save(
"revenant_mafia",
data
);


}




function commitCrime(){


const reward =
Math.floor(
Math.random()*1500
)+500;



State.mafia.money += reward;


State.mafia.respect += 10;


State.mafia.crimes += 1;



updateMafiaStats();



addLog(
`Злочин виконано +${reward} ₴`
);



toast(
`Отримано ${reward} ₴`,
"success"
);


}



document.addEventListener(
"click",
e=>{


if(
e.target.id==="crimeBtn"
){

commitCrime();

}


});



window.addEventListener(
"DOMContentLoaded",
()=>{

updateMafiaStats();

});
/* =================================
   FACTION WAR SYSTEM
================================= */


State.faction =
load(
"revenant_faction",
{

name:"Без фракції",

territories:{

Downtown:"Нейтральна",

Harbor:"Нейтральна",

Industrial:"Нейтральна"

}

}

);



function updateFaction(){


$("#faction").textContent =
State.faction.name;



$("#downtown").textContent =
State.faction.territories.Downtown;


$("#harbor").textContent =
State.faction.territories.Harbor;


$("#industrial").textContent =
State.faction.territories.Industrial;



save(
"revenant_faction",
State.faction
);


}



function joinFaction(){


const select =
$("#factionSelect");


State.faction.name =
select.value;



addLog(
`Вступ у фракцію ${select.value}`
);



updateFaction();



toast(
"Фракцію змінено",
"success"
);


}



function mafiaWar(){


const zones = [

"Downtown",

"Harbor",

"Industrial"

];


const zone =
zones[
Math.floor(
Math.random()*zones.length
)
];



const result =
Math.random()>0.5;



if(result){


State.faction.territories[zone]
=
State.faction.name;


State.mafia.respect += 50;


toast(
`Захоплено ${zone}`,
"success"
);


addLog(
`Фракція захопила ${zone}`
);


}

else{


State.mafia.respect -= 10;


toast(
`Атака провалилась`,
"error"
);


}



updateFaction();

updateMafiaStats();


}




document.addEventListener(
"click",
e=>{


if(
e.target.id==="joinFaction"
){

joinFaction();

}



if(
e.target.id==="startWar"
){

mafiaWar();

}


});



window.addEventListener(
"DOMContentLoaded",
()=>{

updateFaction();

});
/* =================================
   ADMIN PUNISHMENT SYSTEM
================================= */


State.punishments =
load(
"revenant_punishments",
[]
);



function renderPunishments(){


const box =
$("#punishmentLogs");


if(!box) return;


box.innerHTML="";


State.punishments
.forEach(item=>{


box.innerHTML += `

<div class="log">

<b>${item.type}</b>

<br>

Гравець:
${item.player}

<br>

Причина:
${item.reason}

<br>

<small>
${item.date}
</small>

</div>

`;


});


}




function applyPunishment(){


const player =
$("#targetPlayer")
.value.trim();


const type =
$("#punishmentType")
.value;


const reason =
$("#punishmentReason")
.value.trim();



if(!player){

toast(
"Вкажіть гравця",
"error"
);

return;

}



State.punishments.unshift({

id:createID(),

player,

type,

reason:
reason || "Не вказано",

date:
formatTime()

});



save(
"revenant_punishments",
State.punishments
);



renderPunishments();



addLog(
`${type}: ${player}`
);



toast(
"Покарання застосовано",
"success"
);



$("#targetPlayer").value="";

$("#punishmentReason").value="";


}





document.addEventListener(
"click",
e=>{


if(
e.target.id==="applyPunishment"
){

applyPunishment();

}


});



window.addEventListener(
"DOMContentLoaded",
()=>{

renderPunishments();

});
/* =================================
   DATABASE SYSTEM
================================= */


function exportDatabase(){

const database = {

users:State.users,

logs:State.logs,

settings:State.settings,

player:State.player,

mafia:State.mafia,

faction:State.faction,

punishments:State.punishments,

version:CONFIG.version,

date:formatTime()

};


const blob =
new Blob(
[
JSON.stringify(
database,
null,
2
)
],
{
type:"application/json"
}
);



const url =
URL.createObjectURL(blob);



const link =
document.createElement("a");


link.href=url;

link.download=
"revenant_database.json";


link.click();



URL.revokeObjectURL(url);



toast(
"Database exported",
"success"
);


}



function importDatabase(file){


const reader =
new FileReader();



reader.onload = e=>{


try{


const data =
JSON.parse(
e.target.result
);



State.users =
data.users || [];


State.logs =
data.logs || [];


State.settings =
data.settings || {};


State.player =
data.player || {xp:0};


State.mafia =
data.mafia || {};


State.faction =
data.faction || {};


State.punishments =
data.punishments || [];



save(
"revenant_users",
State.users
);


save(
"revenant_logs",
State.logs
);



save(
"revenant_player",
State.player
);



save(
"revenant_mafia",
State.mafia
);



save(
"revenant_faction",
State.faction
);



save(
"revenant_punishments",
State.punishments
);



renderUsers();

renderLogs();

updateProfile();

updateMafiaStats();

updateFaction();

renderPunishments();



toast(
"Database imported",
"success"
);


}

catch{


toast(
"Помилка файлу",
"error"
);


}


};


reader.readAsText(file);


}




function clearDatabase(){


if(!State.owner){

toast(
"Потрібен Owner доступ",
"error"
);

return;

}



localStorage.clear();



toast(
"Database очищено",
"warning"
);



setTimeout(()=>{

location.reload();

},1000);


}





document.addEventListener(
"click",
e=>{


if(
e.target.id==="exportData"
){

exportDatabase();

}



if(
e.target.id==="importData"
){

$("#importFile").click();

}



if(
e.target.id==="clearDatabase"
){

clearDatabase();

}


});



document.addEventListener(
"change",
e=>{


if(
e.target.id==="importFile"
){

importDatabase(
e.target.files[0]
);


}


});



/* =================================
   OWNER SECURITY
================================= */


setInterval(()=>{


const state =
$("#securityState");


if(!state) return;



if(State.owner){

state.textContent =
"OWNER ACTIVE";

state.style.color =
"#00ff66";


}

else{


state.textContent =
"Protected";

state.style.color =
"#ff3333";


}


},1000);
/* =================================
   REVENDANT NOTIFICATION ENGINE
================================= */


const Notification = {

    send(title, text, type="info"){

        const box =
        document.createElement("div");


        box.className =
        "mafiaNotify " + type;


        box.innerHTML = `

        <strong>${title}</strong>

        <span>${text}</span>

        `;


        document.body.appendChild(box);



        setTimeout(()=>{

            box.classList.add("show");

        },50);



        setTimeout(()=>{

            box.classList.remove("show");

            setTimeout(()=>{

                box.remove();

            },500);


        },3500);


    }

};





/* =================================
   SOUND ENGINE
================================= */


const Sound = {


click(){

    if(!State.settings.sounds)
    return;


    const audio =
    new Audio(
    "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAA"
    );


    audio.volume = 0.03;


    audio.play()
    .catch(()=>{});


}


};




document.addEventListener(
"click",
e=>{


if(e.target.tagName==="BUTTON"){

    Sound.click();

}


});





/* =================================
   PAGE TRANSITIONS
================================= */


function animatePanel(panel){


panel.style.opacity="0";

panel.style.transform=
"translateY(30px)";


setTimeout(()=>{


panel.style.transition=
".5s ease";


panel.style.opacity="1";


panel.style.transform=
"translateY(0)";


},50);


}





document.addEventListener(
"click",
e=>{


if(
e.target.classList.contains("menuBtn")
){


document.querySelectorAll(
".menuBtn"
)
.forEach(btn=>{

btn.classList.remove("active");

});


e.target.classList.add("active");



animatePanel(
document.querySelector("#ownerPanel")
);


}


});
