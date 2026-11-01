// =========================================================
// data.js - shared code used on EVERY page
// 1. Vehicle list   2. Save/read helpers   3. Navbar login/logout
// =========================================================


// ----- 1. Default vehicles (used the first time the site opens) -----
const defaultVehicles = [
    { id: "swift",      name: "Maruti Swift",              type: "Car",     fuel: "Petrol",   spec: "Manual",       seats: 5, price: 1500, status: "Available" },
    { id: "creta",      name: "Hyundai Creta",             type: "Car",     fuel: "Diesel",   spec: "Automatic",    seats: 5, price: 2500, status: "Available" },
    { id: "nexon",      name: "Tata Nexon",                type: "Car",     fuel: "Petrol",   spec: "Automatic",    seats: 5, price: 2000, status: "Available" },
    { id: "thar",       name: "Mahindra Thar",             type: "Car",     fuel: "Diesel",   spec: "Manual",       seats: 4, price: 3000, status: "Available" },

    { id: "classic350", name: "Royal Enfield Classic 350", type: "Bike",    fuel: "Petrol",   spec: "349 cc",       seats: 2, price: 900,  status: "Available" },
    { id: "pulsar",     name: "Bajaj Pulsar 150",          type: "Bike",    fuel: "Petrol",   spec: "149 cc",       seats: 2, price: 600,  status: "Booked" },
    { id: "duke200",    name: "KTM Duke 200",              type: "Bike",    fuel: "Petrol",   spec: "199 cc",       seats: 2, price: 1000, status: "Available" },
    { id: "r15",        name: "Yamaha R15",                type: "Bike",    fuel: "Petrol",   spec: "155 cc",       seats: 2, price: 1100, status: "Available" },

    { id: "activa",     name: "Honda Activa 6G",           type: "Scooter", fuel: "Petrol",   spec: "110 cc",       seats: 2, price: 400,  status: "Available" },
    { id: "ather",      name: "Ather 450X",                type: "Scooter", fuel: "Electric", spec: "110 km range", seats: 2, price: 500,  status: "Under Maintenance" },
    { id: "jupiter",    name: "TVS Jupiter",               type: "Scooter", fuel: "Petrol",   spec: "110 cc",       seats: 2, price: 400,  status: "Available" },
    { id: "ola-s1",     name: "Ola S1 Pro",                type: "Scooter", fuel: "Electric", spec: "195 km range", seats: 2, price: 550,  status: "Available" }
];


// ----- 2. Save and read data in the browser (localStorage) -----

// Read a saved value. If nothing is saved yet, return the default value.
function getData(key, defaultValue) {
    const saved = localStorage.getItem(key);
    if (saved === null) {
        return defaultValue;
    }
    return JSON.parse(saved);        // text -> JavaScript object
}

// Save a value (localStorage can only store text, so we convert it)
function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));   // object -> text
}

// 1500 -> "₹1,500" (Indian number format)
function formatPrice(amount) {
    return "₹" + amount.toLocaleString("en-IN");
}


// ----- 3. Navbar: show "Logout" when someone is logged in -----
const currentUser = getData("currentUser", null);
const loginButton = document.querySelector(".login-btn");

if (currentUser !== null && loginButton !== null) {
    loginButton.textContent = "Logout";

    loginButton.addEventListener("click", function (event) {
        event.preventDefault();                  // don't open login.html
        localStorage.removeItem("currentUser");  // forget the user
        window.location.href = "index.html";     // go to the home page
    });
}