// =========================================================
// browse.js - show vehicles and make the filters work (browse.html)
// =========================================================

// All vehicles (saved list, or the default list the first time)
const vehicles = getData("vehicles", defaultVehicles);

// Status text -> CSS class for the colored badge
const statusClasses = {
    "Available": "available",
    "Booked": "booked",
    "Under Maintenance": "maintenance"
};

// Form boxes
const filterForm = document.querySelector(".filter-form");
const searchInput = document.getElementById("search");
const fuelSelect = document.getElementById("fuel");
const maxPriceInput = document.getElementById("max-price");


// ----- 1. Build the HTML for one vehicle box -----
function createVehicleBox(vehicle) {
    return `
        <article class="vehicle-box">
            <div class="box-top">
                <span class="type">${vehicle.type}</span>
                <span class="status ${statusClasses[vehicle.status]}">${vehicle.status}</span>
            </div>
            <h3>${vehicle.name}</h3>
            <ul class="tags">
                <li>${vehicle.fuel}</li>
                <li>${vehicle.spec}</li>
                <li>${vehicle.seats} Seats</li>
            </ul>
            <div class="box-bottom">
                <p class="price">${formatPrice(vehicle.price)} <span>/ day</span></p>
                <a href="vehicle.html#${vehicle.id}" class="btn">View Details</a>
            </div>
        </article>
    `;
}


// ----- 2. Check one vehicle against the filters -----
function matchesFilters(vehicle) {
    const searchText = searchInput.value.trim().toLowerCase();
    const fuel = fuelSelect.value;                 // "all", "petrol", ...
    const maxPrice = Number(maxPriceInput.value);  // 0 if the box is empty

    if (searchText !== "" && !vehicle.name.toLowerCase().includes(searchText)) {
        return false;
    }
    if (fuel !== "all" && vehicle.fuel.toLowerCase() !== fuel) {
        return false;
    }
    if (maxPrice > 0 && vehicle.price > maxPrice) {
        return false;
    }
    return true;   // passed every check
}


// ----- 3. Fill the Cars, Bikes and Scooters sections -----
const sections = [
    { id: "cars",     type: "Car",     word: "cars" },
    { id: "bikes",    type: "Bike",    word: "bikes" },
    { id: "scooters", type: "Scooter", word: "scooters" }
];

function showVehicles() {
    let firstWithResults = null;   // first section that has vehicles

    sections.forEach(function (section) {
        // Vehicles of this type that pass the filters
        const list = vehicles.filter(function (vehicle) {
            return vehicle.type === section.type && matchesFilters(vehicle);
        });

        // Put the boxes inside this section
        const listBox = document.querySelector("#" + section.id + " .vehicle-list");

        if (list.length === 0) {
            listBox.innerHTML = `<p class="subtitle">No ${section.word} match your filters.</p>`;
        } else {
            listBox.innerHTML = list.map(createVehicleBox).join("");

            if (firstWithResults === null) {
                firstWithResults = section.id;
            }
        }

        // Update the count on the category box ("4 vehicles")
        const countText = document.querySelector('.category-box[href="#' + section.id + '"] p');
        countText.textContent = list.length + (list.length === 1 ? " vehicle" : " vehicles");
    });

    return firstWithResults;
}


// ----- 4. Run the filters -----

// Live: update while typing or choosing
filterForm.addEventListener("input", showVehicles);

// Apply button: update and scroll down to the first results
filterForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const firstSection = showVehicles();

    if (firstSection === null) {
        alert("No vehicles match your filters.");
    } else {
        document.getElementById(firstSection).scrollIntoView();
    }
});

// Show everything when the page opens
showVehicles();


// ----- 5. Coming from the home page search? -----
// e.g. browse.html?type=bike  ->  jump to the Bikes section
const params = new URLSearchParams(window.location.search);
const typeFromHome = params.get("type");

if (typeFromHome === "car" || typeFromHome === "bike" || typeFromHome === "scooter") {
    document.getElementById(typeFromHome + "s").scrollIntoView();
}