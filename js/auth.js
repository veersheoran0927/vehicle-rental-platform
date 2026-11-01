// =========================================================
// auth.js - Login and Register (login.html only)
// =========================================================

// Fixed admin account (for the demo)
const ADMIN_EMAIL = "admin@rideeasy.in";
const ADMIN_PASSWORD = "admin123";


// ----- Helper: show a message bubble on an input box -----
function showError(input, message) {
    input.setCustomValidity(message);   // mark the box as invalid
    input.reportValidity();             // show the browser's message bubble

    // Remove the error as soon as the user types again
    input.addEventListener("input", function () {
        input.setCustomValidity("");
    }, { once: true });
}


// ----- 1. Show / hide password (eye button) -----
const eyeButtons = document.querySelectorAll(".show-pass");

eyeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        // The password box is in the same <div> as the button
        const input = button.parentElement.querySelector("input");

        if (input.type === "password") {
            input.type = "text";        // show
        } else {
            input.type = "password";    // hide
        }
    });
});


// ----- 2. Register -----
const registerForm = document.querySelector(".register-form");

registerForm.addEventListener("submit", function (event) {
    event.preventDefault();   // stop the page from reloading

    const name = document.getElementById("reg-name").value.trim();
    const emailInput = document.getElementById("reg-email");
    const phoneInput = document.getElementById("reg-phone");
    const password = document.getElementById("reg-password").value;
    const confirmInput = document.getElementById("reg-confirm");
    const email = emailInput.value.trim().toLowerCase();

    // Check 1: phone must be exactly 10 digits
    if (!/^[0-9]{10}$/.test(phoneInput.value)) {
        showError(phoneInput, "Enter a 10-digit mobile number.");
        return;
    }

    // Check 2: both passwords must match
    if (confirmInput.value !== password) {
        showError(confirmInput, "Passwords do not match.");
        return;
    }

    // Check 3: email must not be registered already
    const users = getData("users", []);
    const alreadyExists = users.some(function (user) {
        return user.email === email;
    });

    if (alreadyExists) {
        showError(emailInput, "This email is already registered. Please log in.");
        return;
    }

    // All good: save the new user
    users.push({ name: name, email: email, phone: phoneInput.value, password: password });
    saveData("users", users);

    alert("Account created! Please log in.");
    registerForm.reset();

    // Switch to the Login tab and fill in the email
    document.getElementById("tab-login").checked = true;
    document.getElementById("login-email").value = email;
});


// ----- 3. Login -----
const loginForm = document.querySelector(".login-form");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const passwordInput = document.getElementById("login-password");
    const password = passwordInput.value;
    const role = document.getElementById("role").value;

    // Admin login
    if (role === "admin") {
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            saveData("currentUser", { name: "Admin", email: email, role: "admin" });
            window.location.href = "admin.html";
        } else {
            showError(passwordInput, "Wrong admin email or password.");
        }
        return;
    }

    // Customer login: find a user with this email AND password
    const users = getData("users", []);
    const user = users.find(function (u) {
        return u.email === email && u.password === password;
    });

    if (user) {
        saveData("currentUser", { name: user.name, email: user.email, role: "customer" });
        window.location.href = "browse.html";
    } else {
        showError(passwordInput, "Wrong email or password.");
    }
});