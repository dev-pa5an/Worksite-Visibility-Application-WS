var socket = io.connect("http://localhost:8000");
// Initialize the map
var map = L.map('map', {
    zoomControl: false,  // Disables zoom control buttons (+/-)
    scrollWheelZoom: false, // Disables zooming with the scroll wheel
    doubleClickZoom: false, // Disables zooming on double-click
    touchZoom: false,  // Disables zooming with touch gestures (pinch)
    boxZoom: false // Disables zooming by dragging a box
}).setView([51.4925, -0.077], 16);

// var map = L.map('map').setView([51.49532, -0.07], 16); // Set the center coordinates and zoom level

// Define the bounds for your custom image
var imageUrl = 'static/map.jpg'; // Path to your custom image (replace with the correct path)
var imageBounds = [[51.485, -0.094], [51.5, -0.06]]; // Define the geographical bounds (top-left and bottom-right corners)

// Add the image as an overlay on the map
L.imageOverlay(imageUrl, imageBounds).addTo(map);
map.fitBounds(imageBounds);

// Handle WebSocket Messages
socket.on("initialize", function(data) {
    const tableBody = document.getElementById("data-body");
    tableBody.innerHTML = ""; // 🔹 Clear table to prevent duplicates

    data.forEach(addRow);
});
let markers = {}; // Store marker references

// Load existing markers when connected
socket.on("load_markers", function (data) {
    clearMarkers(); // 🔹 Clear previous markers
    data.forEach((marker) => addMarker(marker, false)); // 🔹 Add all markers
});


// Handle marker updates
socket.on("update_markers", function(data) {
    clearMarkers();
    data.forEach((marker) => addMarker(marker, false));
});


function addMarker(markerData, emit = true) {
    // Create a marker icon
    const marker = L.marker([markerData.lat, markerData.lng], { draggable: true }).addTo(map);

    // Create a text box (popup-like div)
    const customPopup = L.divIcon({
        className: "custom-marker", // CSS styling
        html: `
            <div class="marker-label">
                <strong>${markerData.name}</strong> ${markerData.location} ${markerData.count} 
            </div>
        `,
        
        iconSize: [180, 15], // Adjust size as needed
        iconAnchor: [-7, 50] // Adjust position relative to marker
    });

    // Attach the text box next to the marker
    const label = L.marker([markerData.lat, markerData.lng], { icon: customPopup }).addTo(map);

    // Handle marker drag
    marker.on("dragend", function () {
        const { lat, lng } = marker.getLatLng();

        label.setLatLng([lat, lng]); // Move label with marker
        delete markers[markerData.id];
        markers[markerData.id] = { marker, label };
        // Emit updated marker position
        
        socket.emit("update_marker", { id: markerData.id, lat, lng, name: markerData.name, location: markerData.location, count: markerData.count});

    });

    // Store marker references
    markers[markerData.id] = { marker, label };

    // Emit new marker data if it's a user-added marker
    if (emit) {
        socket.emit("add_marker", markerData);
    }
}
// Remove all markers
function clearMarkers() {
    Object.values(markers).forEach(({ marker, label }) => {
        map.removeLayer(marker); // Remove the marker
        map.removeLayer(label);  // Remove the label
    });
    markers = {}; // Reset the markers object
}

map.on("click", function (e) {
    
    document.getElementById('form-container').style.display = 'block';
    currentLatLng = e.latlng;
    // const markerData = {
    //     id: Date.now().toString(),
    //     lat: e.latlng.lat,
    //     lng: e.latlng.lng,
    //     name: e.name,
    //     location: e.location,
    //     count: e.count
    // };
    // addMarker(markerData, true);
    
});

socket.on("newEntry", (entry) => {
    if (!entryExists(entry.name, entry.location, entry.count)) {
        addRow(entry);
    }
});

// Function to check if entry already exists
function entryExists(name, location, count) {
    const rows = document.querySelectorAll("#table-body tr");
    for (const row of rows) {
        const [existingName, existingLocation, existingCount] = row.children;
        if (existingName.innerText === name && existingLocation.innerText === location  && existingCount === count) {
            return true;
        }
    }
    return false;
}

function addRow(data) {
    var tableBody = document.getElementById("data-body");
    var row = tableBody.insertRow();
    row.insertCell(0).textContent = data.name;
    row.insertCell(1).textContent = data.location;
    row.insertCell(2).textContent = data.count;
}

function saveDetails() {
    var name = document.getElementById('name').value;
    var location = document.getElementById('location').value;
    var count = document.getElementById('count').value;

    if (name.trim() === "" || location.trim() === "" || count.trim() === "") {
        alert("Please fill in both fields!");
        return;
    }
    const markerData = {
        id: Date.now().toString(),
        lat: currentLatLng.lat,
        lng: currentLatLng.lng,
        name: name,
        location: location,
        count: count
    };
    addMarker(markerData, true);
    // Hide form and clear input fields
    document.getElementById('form-container').style.display = 'none';
    document.getElementById('name').value = '';
    document.getElementById('location').value = '';
    document.getElementById('count').value = '';

    socket.emit("newEntry", { name, location, count });

}

// Function to cancel entry and hide form
function cancelEntry() {
    document.getElementById('form-container').style.display = 'none';
    document.getElementById('name').value = '';
    document.getElementById('location').value = '';
    document.getElementById('count').value = '';

    if (currentMarker) {
        map.removeLayer(currentMarker); // Remove marker if user cancels
        currentMarker = null;
    }
}
function removeMarker(id) {
    if (markers[id]) {
        map.removeLayer(markers[id].marker);
        map.removeLayer(markers[id].label);
        delete markers[id]; // Remove from dictionary

        // Emit event to remove marker for all clients
        socket.emit("delete_marker", { id });
    }
}
