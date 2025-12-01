function sendAlert(payload) {
  fetch("https://your-backend-url.com/api/v1/alerts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => console.log("Alert Sent", data))
  .catch(err => console.error("Error sending alert", err));
}