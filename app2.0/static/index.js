var socket = io.connect("http://localhost:8000");
// Initialize the map
var map = L.map('map', {
    zoomControl: false,  
    scrollWheelZoom: true, 
    doubleClickZoom: false, 
    touchZoom: false, 
    boxZoom: false 
}).setView([51.4925, -0.077], 16);


var imageUrl = 'static/map.jpg'; 
var imageBounds = [[51.485, -0.094], [51.5, -0.06]];

L.imageOverlay(imageUrl, imageBounds).addTo(map);
map.fitBounds(imageBounds);

socket.on("initialize", function(data) {
    const tableBody = document.getElementById("data-body");
    tableBody.innerHTML = ""; 

    data.forEach(addRow);
});
let markers = {};

socket.on("load_markers", function (data) {
    clearMarkers(); 
    data.forEach((marker) => addMarker(marker, false)); 
});


socket.on("update_markers", function(data) {
    clearMarkers();
    updateTotal();
    data.forEach((marker) => addMarker(marker, false));
});


function addMarker(markerData, emit = true) {
  
    const marker = L.marker([markerData.lat, markerData.lng], { draggable: true }).addTo(map);
    const customPopup = L.divIcon({
        className: "custom-marker",
        html: `
            <div class="marker-label">
                <strong>${markerData.name} ${markerData.location} ${markerData.count}</strong>
                <button class="close-btn" onclick="removeMarker('${markerData.id}', event)">✖</button>
            </div>
        `,
        iconSize: [180, 20], 
        iconAnchor: [-7, 50] 
    });

    const label = L.marker([markerData.lat, markerData.lng], { icon: customPopup }).addTo(map);

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
        map.removeLayer(marker); 
        map.removeLayer(label);  
    });
    markers = {}; // Reset the markers object
}

map.on("click", function (e) {
    
    document.getElementById('form-container').style.display = 'block';
    currentLatLng = e.latlng;

});

socket.on("newEntry", (entry) => {
    if (!entryExists(entry.name, entry.location, entry.count)) {
        addRow(entry);
    }
});

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

    if (!data.id) {
        console.error("ERROR: Missing id for row data", data);
        return;
    }

    row.setAttribute("data-id", data.id);
    console.log(`set the data-id ${data.id}`);


    row.insertCell(0).textContent = data.name;
    row.insertCell(1).textContent = data.location;
    row.insertCell(2).textContent = data.count;

    updateTotal();
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
    console.log(`Generated the marker Data ${markerData}`)
    addMarker(markerData, true);
    // Hide form and clear input fields
    document.getElementById('form-container').style.display = 'none';
    document.getElementById('name').value = '';
    document.getElementById('location').value = '';
    document.getElementById('count').value = '';

    socket.emit("newEntry", markerData);

}

function cancelEntry() {
    document.getElementById('form-container').style.display = 'none';
    document.getElementById('name').value = '';
    document.getElementById('location').value = '';
    document.getElementById('count').value = '';

    if (currentMarker) {
        map.removeLayer(currentMarker); 
        currentMarker = null;
    }
}
function removeMarker(id, event) {
    if (event) {
        event.stopPropagation(); 
    }
    if (markers[id]) {
        map.removeLayer(markers[id].marker);
        map.removeLayer(markers[id].label);
        delete markers[id];

        socket.emit("delete_marker", { id });
        
    }
}
function removeMarker(id, event) {
    if (event) {
        event.stopPropagation();
    }
    if (markers[id]) {
        map.removeLayer(markers[id].marker);
        map.removeLayer(markers[id].label);
        delete markers[id];
        updateTotal();
        socket.emit("delete_marker", { id });
    }
}

socket.on("deleteEntry", (data) => {
    deleteRow(data.id);
});

function deleteRow(id) {
    const row = document.querySelector(`#data-body tr[data-id='${id}']`);
    if (row) {
        row.remove(); 
        updateTotal();
    }
}

function updateTotal() {
    let total = 0;
    const tableBody = document.getElementById("data-body");
    const rows = tableBody.getElementsByTagName("tr");

    for (const row of rows) {
        const countCell = row.cells[2]; 
        const countValue = parseInt(countCell.textContent) || 0;
        total += countValue;
    }

    document.getElementById("total-count").textContent = total;
}



