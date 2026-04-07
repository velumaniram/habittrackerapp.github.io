let user = localStorage.getItem("user");

const today = new Date().toISOString().split("T")[0];
document.getElementById("dateDisplay").innerText = "Today: " + today;

function login() {
    const username = document.getElementById("username").value;
    if (!username) return;

    localStorage.setItem("user", username);
    location.reload();
}

if (user) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("appSection").style.display = "block";
}

let habits = JSON.parse(localStorage.getItem("habits_" + user)) || [];

function saveData() {
    localStorage.setItem("habits_" + user, JSON.stringify(habits));
    if (typeof syncToFirebase === "function") syncToFirebase(habits);
}

function addHabit() {
    const input = document.getElementById("habitInput");
    const name = input.value.trim();
    if (!name) return;

    habits.push({ name, history: {} });
    input.value = "";
    saveData();
    render();
}

function toggleHabit(i) {
    const h = habits[i];
    h.history[today] = !h.history[today];
    saveData();
    render();
}

function deleteHabit(i) {
    habits.splice(i, 1);
    saveData();
    render();
}

function render() {
    const list = document.getElementById("habitList");
    list.innerHTML = "";

    habits.forEach((h, i) => {
        const checked = h.history[today] ? "checked" : "";
        list.innerHTML += `
        <li>
            <div>
                <input type="checkbox" ${checked} onclick="toggleHabit(${i})">
                ${h.name}
            </div>
            <button onclick="deleteHabit(${i})">X</button>
        </li>`;
    });

    updateChart();
}

function updateChart() {
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7.push(d.toISOString().split("T")[0]);
    }

    const counts = last7.map(date =>
        habits.filter(h => h.history[date]).length
    );

    const ctx = document.getElementById("chart").getContext("2d");

    if (window.chart) window.chart.destroy();

    window.chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: last7,
            datasets: [{
                label: "Completed Habits",
                data: counts
            }]
        }
    });
}

function enableNotifications() {
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            setInterval(() => {
                new Notification("Habit Reminder", {
                    body: "Complete your habits today!"
                });
            }, 86400000);
        }
    });
}

render();
