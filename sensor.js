let accelWindow = [];
const WINDOW_SIZE = 25;

function requestSensorPermission() {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission();
  }
}

function startSensorStream() {
  window.addEventListener('devicemotion', (e) => {
    const ax = e.accelerationIncludingGravity.x || 0;
    const ay = e.accelerationIncludingGravity.y || 0;
    const az = e.accelerationIncludingGravity.z || 0;

    const mag = Math.sqrt(ax*ax + ay*ay + az*az);

    accelWindow.push(mag);
    if (accelWindow.length > WINDOW_SIZE) accelWindow.shift();

    detectEvent(accelWindow);
  });
}