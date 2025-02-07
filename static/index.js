function updateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentTime').textContent = `${now.toLocaleDateString(undefined, options)} | ${now.toLocaleTimeString()}`;
}
setInterval(updateTime, 1000);
updateTime();

const locationMap = {
    'NorthEnd': { top: '-15px', left: '197px' },
    '4F': { top: '652px', left: '244px' }, '4E': { top: '576px', left: '244px' },
    '4D': { top: '496px', left: '244px' }, '4C': { top: '414px', left: '244px' },
    'Admin_Building': { top: '597px', left: '1010px' },
    'ENG_Building': { top: '381px', left: '996px' },
    'Contractor_Containers': { top: '170px', left: '887px' }
};

function createContractorLabel(location, contractor, workers, equipment) {
    let label = document.querySelector(`.contractor-label[data-location="${location}"]`);
    if (!label) {
        label = document.createElement('div');
        label.classList.add('contractor-label');
        label.style.top = locationMap[location].top;
        label.style.left = locationMap[location].left;
        label.dataset.location = location;
        label.innerHTML = '<div class="label-text"></div>';
        document.querySelector('.map-container').appendChild(label);
    }
    
    const contractorEntry = document.createElement('div');
    contractorEntry.classList.add('contractor-entry');
    contractorEntry.innerHTML = `<button class="remove-btn">×</button> ${contractor} (${workers}) ${equipment}`;
    label.querySelector('.label-text').appendChild(contractorEntry);
}

function updateSummaryTable(contractor, location, workers) {
    const tableBody = document.getElementById('summaryTable').querySelector('tbody');
    const row = document.createElement('tr');
    row.innerHTML = `<td>${contractor}</td><td>${location}</td><td>${workers}</td><td><button class="remove-btn">X</button></td>`;
    tableBody.appendChild(row);
    document.getElementById('totalWorkers').textContent = parseInt(document.getElementById('totalWorkers').textContent, 10) + workers;
}

document.getElementById('allocationForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const contractor = document.getElementById('contractor').value.trim();
    const location = document.getElementById('location').value;
    const equipment = document.getElementById('equipment').value;
    const workers = parseInt(document.getElementById('workers').value, 10) || 0;

    if (!contractor || !location || !workers) return alert("Please fill in all fields before submitting.");
    if (!locationMap[location]) return alert("Invalid location selected.");
    
    createContractorLabel(location, contractor, workers, equipment);
    updateSummaryTable(contractor, location, workers);
    this.reset();
});

document.getElementById('summaryTable').addEventListener('click', function(event) {
    if (event.target.classList.contains('remove-btn')) {
        const row = event.target.closest('tr');
        const workersCount = parseInt(row.children[2].textContent, 10) || 0;
        row.remove();
        document.getElementById('totalWorkers').textContent = parseInt(document.getElementById('totalWorkers').textContent, 10) - workersCount;
    }
});

document.addEventListener("keydown", function(event) {
    if (event.key === "F5" || (event.ctrlKey && event.key === "r")) {
        event.preventDefault();
        alert("Page refresh is disabled!");
    }
    if (["F12", "I", "J", "U"].includes(event.key) && (event.ctrlKey || event.shiftKey)) {
        event.preventDefault();
        alert("Developer tools are disabled!");
    }
});

window.addEventListener("beforeunload", function(event) {
    event.preventDefault();
    event.returnValue = "";
});

history.pushState(null, "", location.href);
window.onpopstate = function () { history.pushState(null, "", location.href); };
