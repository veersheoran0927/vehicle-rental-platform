// =========================================================
// admin.js - Admin dashboard (admin.html)
// Stats, vehicles, bookings and maintenance
// =========================================================


// ----- 0. Only the admin can open this page -----
if (currentUser === null || currentUser.role !== "admin") {
    alert("Please log in as Admin to open the dashboard.");
    window.location.href = "login.html";
}


// Saved lists (or defaults the first time)
let vehicles = getData("vehicles", defaultVehicles);
let bookings = getData("bookings", []);
let services = getData("services", [
    { vehicleId: "ather", vehicleName: "Ather 450X",   service: "Battery Check", date: "2026-10-29", status: "In Progress" },
    { vehicleId: "swift", vehicleName: "Maruti Swift", service: "Oil Change",    date: "2026-11-15", status: "Scheduled" }
]);

// Status text -> CSS badge class
const badgeClasses = {
    "Available": "available",
    "Booked": "booked",
    "Under Maintenance": "maintenance",
    "In Progress": "maintenance",
    "Scheduled": "upcoming",
    "Done": "completed"
};

// "2026-11-10" -> "10-11-2026"
function formatDate(dateText) {
    return dateText.split("-").reverse().join("-");
}

// Save all lists and redraw the whole page
function saveAndRefresh() {
    saveData("vehicles", vehicles);
    saveData("bookings", bookings);
    saveData("services", services);
    showStats();
    showVehicles();
    showBookings();
    showServices();
}


// ----- 1. Dashboard numbers -----
function showStats() {
    const activeRentals = bookings.filter(function (b) {
        return b.status === "Active";
    }).length;

    // Revenue = approved bookings (not pending, not cancelled)
    let revenue = 0;
    bookings.forEach(function (b) {
        if (b.status === "Upcoming" || b.status === "Active" || b.status === "Completed") {
            revenue = revenue + b.amount;
        }
    });

    const inService = vehicles.filter(function (v) {
        return v.status === "Under Maintenance";
    }).length;

    const numbers = document.querySelectorAll(".stat-box p");
    numbers[0].textContent = vehicles.length;
    numbers[1].textContent = activeRentals;
    numbers[2].textContent = formatPrice(revenue);
    numbers[3].textContent = inService;
}


// ----- 2. Vehicles table -----
function showVehicles() {
    const tbody = document.querySelector("#vehicles tbody");

    tbody.innerHTML = vehicles.map(function (v) {
        // "Service" only for vehicles that are free
        let serviceButton = "";
        if (v.status === "Available") {
            serviceButton = `<button type="button" class="btn-small btn-outline" onclick="sendToService('${v.id}')">Service</button>`;
        }

        return `
            <tr>
                <td>${v.name}</td>
                <td>${v.type}</td>
                <td>${formatPrice(v.price)}</td>
                <td><span class="status ${badgeClasses[v.status]}">${v.status}</span></td>
                <td>
                    <button type="button" class="btn-small btn-outline" onclick="editPrice('${v.id}')">Edit</button>
                    ${serviceButton}
                    <button type="button" class="btn-small btn-danger" onclick="deleteVehicle('${v.id}')">Delete</button>
                </td>
            </tr>`;
    }).join("");
}

// Find a vehicle by its id
function findVehicle(id) {
    return vehicles.find(function (v) {
        return v.id === id;
    });
}

// Add a new vehicle
document.querySelector(".add-vehicle-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("v-name").value.trim();
    const typeValue = document.getElementById("v-type").value;   // "car"
    const fuelValue = document.getElementById("v-fuel").value;   // "petrol"

    // "car" -> "Car"
    const type = typeValue.charAt(0).toUpperCase() + typeValue.slice(1);
    const fuel = fuelValue.charAt(0).toUpperCase() + fuelValue.slice(1);

    vehicles.push({
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now(),   // unique id
        name: name,
        type: type,
        fuel: fuel,
        spec: "Standard",
        seats: type === "Car" ? 5 : 2,
        price: Number(document.getElementById("v-price").value),
        status: "Available"
    });

    event.target.reset();
    saveAndRefresh();
    alert(name + " added. It now shows on the Browse page.");
});

// Change the price
function editPrice(id) {
    const vehicle = findVehicle(id);
    const newPrice = prompt("New price per day for " + vehicle.name + " (₹):", vehicle.price);

    if (newPrice === null) {
        return;   // admin clicked Cancel
    }
    if (isNaN(newPrice) || Number(newPrice) <= 0) {
        alert("Please enter a valid price.");
        return;
    }

    vehicle.price = Number(newPrice);
    saveAndRefresh();
}

// Delete a vehicle
function deleteVehicle(id) {
    const vehicle = findVehicle(id);

    if (confirm("Delete " + vehicle.name + "?")) {
        vehicles = vehicles.filter(function (v) {
            return v.id !== id;
        });
        saveAndRefresh();
    }
}


// ----- 3. Bookings table -----
function showBookings() {
    const tbody = document.querySelector("#bookings tbody");

    if (bookings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">No bookings yet.</td></tr>`;
        return;
    }

    // Newest first ( [...bookings] makes a copy so the saved order stays the same )
    tbody.innerHTML = [...bookings].reverse().map(function (b) {
        // Next step for each status
        let actions = "-";
        if (b.status === "Pending") {
            actions = `
                <button type="button" class="btn-small" onclick="changeBooking('${b.id}', 'Upcoming')">Approve</button>
                <button type="button" class="btn-small btn-danger" onclick="changeBooking('${b.id}', 'Cancelled')">Reject</button>`;
        } else if (b.status === "Upcoming") {
            actions = `<button type="button" class="btn-small btn-outline" onclick="changeBooking('${b.id}', 'Active')">Mark Picked Up</button>`;
        } else if (b.status === "Active") {
            actions = `<button type="button" class="btn-small btn-outline" onclick="changeBooking('${b.id}', 'Completed')">Mark Returned</button>`;
        }

        return `
            <tr>
                <td>${b.id}</td>
                <td>${b.customer}</td>
                <td>${b.vehicleName}</td>
                <td>${formatDate(b.pickupDate)} to ${formatDate(b.returnDate)}</td>
                <td><span class="status ${b.status.toLowerCase()}">${b.status}</span></td>
                <td>${actions}</td>
            </tr>`;
    }).join("");
}

// Move a booking to its next status
function changeBooking(bookingId, newStatus) {
    const booking = bookings.find(function (b) {
        return b.id === bookingId;
    });
    const vehicle = findVehicle(booking.vehicleId);

    booking.status = newStatus;

    // Keep the vehicle status in sync
    if (vehicle) {
        if (newStatus === "Upcoming") {
            vehicle.status = "Booked";       // approved: reserve the vehicle
        } else if (newStatus === "Completed") {
            vehicle.status = "Available";    // returned: free again
        }
    }

    saveAndRefresh();
}


// ----- 4. Maintenance table -----
function showServices() {
    const tbody = document.querySelector("#maintenance tbody");

    tbody.innerHTML = [...services].reverse().map(function (s, index) {
        // index counts from the end because the list is reversed
        const realIndex = services.length - 1 - index;

        let action = "-";
        if (s.status === "In Progress") {
            action = `<button type="button" class="btn-small btn-outline" onclick="finishService(${realIndex})">Mark Done</button>`;
        }

        return `
            <tr>
                <td>${s.vehicleName}</td>
                <td>${s.service}</td>
                <td>${formatDate(s.date)}</td>
                <td><span class="status ${badgeClasses[s.status]}">${s.status}</span></td>
                <td>${action}</td>
            </tr>`;
    }).join("");
}

// Send a vehicle for service
function sendToService(id) {
    const vehicle = findVehicle(id);
    const service = prompt("Service type for " + vehicle.name + ":", "General Service");

    if (service === null || service.trim() === "") {
        return;
    }

    vehicle.status = "Under Maintenance";
    services.push({
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        service: service.trim(),
        date: new Date().toLocaleDateString("en-CA"),   // today, YYYY-MM-DD
        status: "In Progress"
    });

    saveAndRefresh();
}

// Service finished: vehicle is available again
function finishService(index) {
    const record = services[index];
    record.status = "Done";

    const vehicle = findVehicle(record.vehicleId);
    if (vehicle) {
        vehicle.status = "Available";
    }

    saveAndRefresh();
}


// ----- Draw everything when the page opens -----
saveAndRefresh();