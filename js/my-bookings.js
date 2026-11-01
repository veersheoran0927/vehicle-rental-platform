// =========================================================
// my-bookings.js - show the logged-in user's bookings
// =========================================================

const tableBody = document.querySelector(".bookings-table tbody");


// "2026-11-10" -> "10-11-2026"
function formatDate(dateText) {
    return dateText.split("-").reverse().join("-");
}


// ----- 1. Show the bookings in the table -----
function showMyBookings() {
    // Not logged in: ask to log in
    if (currentUser === null) {
        tableBody.innerHTML = `
            <tr><td colspan="7">Please <a href="login.html">log in</a> to see your bookings.</td></tr>`;
        return;
    }

    // Only this user's bookings, newest first
    const myBookings = getData("bookings", [])
        .filter(function (booking) {
            return booking.userEmail === currentUser.email;
        })
        .reverse();

    if (myBookings.length === 0) {
        tableBody.innerHTML = `
            <tr><td colspan="7">No bookings yet. <a href="browse.html">Browse vehicles</a> to book your first ride.</td></tr>`;
        return;
    }

    // One table row per booking
    tableBody.innerHTML = myBookings.map(function (booking) {
        // What can the user do with this booking?
        let action = "-";
        if (booking.status === "Pending" || booking.status === "Upcoming") {
            action = `<button type="button" class="btn-small btn-outline" onclick="cancelBooking('${booking.id}')">Cancel</button>`;
        } else if (booking.status === "Completed") {
            action = `<a href="vehicle.html#${booking.vehicleId}">Write Review</a>`;
        }

        return `
            <tr>
                <td>${booking.id}</td>
                <td>${booking.vehicleName}</td>
                <td>${formatDate(booking.pickupDate)}</td>
                <td>${formatDate(booking.returnDate)}</td>
                <td>${formatPrice(booking.amount)}</td>
                <td><span class="status ${booking.status.toLowerCase()}">${booking.status}</span></td>
                <td>${action}</td>
            </tr>`;
    }).join("");
}


// ----- 2. Cancel a booking -----
function cancelBooking(bookingId) {
    if (!confirm("Cancel booking " + bookingId + "?")) {
        return;   // user clicked "Cancel" in the popup
    }

    const bookings = getData("bookings", []);
    const booking = bookings.find(function (b) {
        return b.id === bookingId;
    });

    // If the admin had already approved it, the vehicle is free again
    if (booking.status === "Upcoming") {
        const vehicles = getData("vehicles", defaultVehicles);
        const vehicle = vehicles.find(function (v) {
            return v.id === booking.vehicleId;
        });
        if (vehicle) {
            vehicle.status = "Available";
            saveData("vehicles", vehicles);
        }
    }

    booking.status = "Cancelled";
    saveData("bookings", bookings);

    showMyBookings();   // refresh the table
}


// Show the table when the page opens
showMyBookings();