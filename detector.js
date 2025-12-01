const IMPACT_THRESHOLD = 25;

function detectEvent(windowData) {
  const peak = Math.max(...windowData);

  if (peak > IMPACT_THRESHOLD) {
    console.log("Impact detected", peak);

    navigator.geolocation.getCurrentPosition((pos) => {
      sendAlert({
        type: "fall",
        peak,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        time: new Date().toISOString()
      });
    });
  }
}