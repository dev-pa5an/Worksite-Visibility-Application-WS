document.addEventListener("DOMContentLoaded", function () {
    function updateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = now.toLocaleDateString(undefined, options);
        const formattedTime = now.toLocaleTimeString();
        document.getElementById('currentTime').textContent = `${formattedDate} | ${formattedTime}`;
    }

    updateTime();
    setInterval(updateTime, 1000);

    document.getElementById('allocationForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const contractor = document.getElementById('contractor').value.trim();
        const location = document.getElementById('location').value;
        const equipment = document.getElementById('equipment').value;
        const workers = parseInt(document.getElementById('workers').value, 10);

        if (!location || !workers) {
            alert("Please fill in all fields before submitting.");
            return;
        }

        const summaryTable = document.getElementById("summaryTable").getElementsByTagName('tbody')[0];
        const newRow = summaryTable.insertRow();
        newRow.innerHTML = `<td>${contractor}</td><td>${location}</td><td>${workers}</td>`;

        let totalWorkersElement = document.getElementById("totalWorkers");
        totalWorkersElement.textContent = parseInt(totalWorkersElement.textContent, 10) + workers;
    });
});
