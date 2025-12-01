// Dark mode toggle
const themeToggle = document.getElementById("themeToggle");
themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
};

// Loading Screen
window.onload = () => {
  setTimeout(() => {
    document.getElementById("loadingScreen").classList.add("hidden");
  }, 1500);
};

// Live Chart
let ctx = document.getElementById("accelChart").getContext("2d");
let accelChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{ label: "Acceleration", data: [] }]
  },
  options: {
    responsive: true,
    animation: false,
    scales: { y: { beginAtZero: true } }
  }
});

function updateChart(value) {
  if (accelChart.data.labels.length > 30) accelChart.data.labels.shift();
  if (accelChart.data.datasets[0].data.length > 30) accelChart.data.datasets[0].data.shift();

  accelChart.data.labels.push(".");
  accelChart.data.datasets[0].data.push(value);
  accelChart.update();
}


// Fall alert UI
function showAlertBanner() {
  let banner = document.getElementById("alertBanner");
  banner.style.display = "block";
  navigator.vibrate([300, 200, 300]);

  setTimeout(() => banner.style.display = "none", 3000);
}


// PWA Install Button
let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove("hidden");
});

installBtn.onclick = async () => {
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  installBtn.classList.add("hidden");
};
