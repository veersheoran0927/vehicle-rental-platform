// =========================================================
// booking.js - live price and saving the booking (booking.html)
// =========================================================

const DEPOSIT = 1000;   // security deposit in ₹

const allVehicles = getData("vehicles", defaultVehicles);

// Form boxes
const bookingForm = document.querySelector(".booking-form");
const vehicleSelect = document.getElementById("vehicle");
const pickupInput = document.getElementById("pickup-date");
const returnInput = document.getElementById("return-date");


// ----- 1. Fill the vehicle dropdown from the vehicle list -----
// (so vehicles added by the admin also appear here)
function fillVehicleDropdown() {
    let html = '<option value="">-- Choose a vehicle --</option>';

    ["Car", "Bike", "Scooter"].forEach(function (type) {
        html += `<optgroup label="${type}s">`;

        allVehicles.forEach(function (vehicle) {
            if (vehicle.type !== type) {
                return;   // skip other types
            }

            if (vehicle.status === "Available") {
                html += `<option value="${vehicle.id}">${vehicle.name} - ${formatPrice(vehicle.price)}/day</option>`;
            } else {
                // Booked / Under Maintenance: shown but can't be chosen
                html += `<option value="${vehicle.id}" disabled>${vehicle.name} (${vehicle.status})</option>`;
            }
        });

        html += "</optgroup>";
    });

    vehicleSelect.innerHTML = html;
}

fillVehicleDropdown();


// ----- 2. Dates: no past dates, return can't be before pickup -----
const today = new Date().toLocaleDateString("en-CA");   // "2026-11-02" (YYYY-MM-DD)
pickupInput.min = today;
returnInput.min = today;

pickupInput.addEventListener("change", function () {
    returnInput.min = pickupInput.value;
});


// ----- 3. Live price summary -----
function getDays() {
    if (pickupInput.value === "" || returnInput.value === "") {
        return 0;
    }
    const pickup = new Date(pickupInput.value);
    const drop = new Date(returnInput.value);
    const oneDay = 1000 * 60 * 60 * 24;   // milliseconds in a day

    const days = (drop - pickup) / oneDay;
    if (days < 0) {
        return 0;              // return date is before pickup
    }
    return Math.max(days, 1);  // same-day return = 1 day
}

function updatePrice() {
    const vehicle = allVehicles.find(function (v) {
        return v.id === vehicleSelect.value;
    });

    const rent = vehicle ? vehicle.price : 0;
    const days = getDays();
    const total = (rent > 0 && days > 0) ? rent * days + DEPOSIT : 0;

    document.getElementById("rent-per-day").textContent = formatPrice(rent);
    document.getElementById("num-days").textContent = days;
    document.getElementById("total").textContent = formatPrice(total);

    return total;
}

// Recalculate whenever the vehicle or a date changes
vehicleSelect.addEventListener("change", updatePrice);
pickupInput.addEventListener("change", updatePrice);
returnInput.addEventListener("change", updatePrice);


// ----- 4. Fill in name and email if the user is logged in -----
if (currentUser !== null) {
    document.getElementById("name").value = currentUser.name;
    document.getElementById("email").value = currentUser.email;
}


// ----- 5. Confirm Booking -----
bookingForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Must be logged in to book
    if (currentUser === null) {
        alert("Please log in first to book a vehicle.");
        window.location.href = "login.html";
        return;
    }

    // Return date can't be before pickup date
    if (getDays() === 0) {
        returnInput.setCustomValidity("Return date must be on or after the pickup date.");
        returnInput.reportValidity();
        returnInput.addEventListener("change", function () {
            returnInput.setCustomValidity("");
        }, { once: true });
        return;
    }

    const vehicle = allVehicles.find(function (v) {
        return v.id === vehicleSelect.value;
    });
    const bookings = getData("bookings", []);

    // New booking (RE101, RE102, ...)
    const booking = {
        id: "RE" + (101 + bookings.length),
        userEmail: currentUser.email,
        customer: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        location: document.getElementById("pickup-location").value.trim(),
        pickupDate: pickupInput.value,
        returnDate: returnInput.value,
        payment: document.querySelector('input[name="payment"]:checked').value,
        amount: updatePrice(),
        status: "Pending"   // the admin will approve it
    };

    bookings.push(booking);
    saveData("bookings", bookings);

    alert("Booking " + booking.id + " sent! Total: " + formatPrice(booking.amount) + ". The admin will approve it soon.");
    window.location.href = "my-bookings.html";
});