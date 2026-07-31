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
