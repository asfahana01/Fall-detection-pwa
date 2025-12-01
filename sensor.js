class SensorManager {
  constructor(callback) {
    this.callback = callback;
  }

  start() {
    window.addEventListener("devicemotion", (e) => {
      let ax = e.acceleration.x || 0;
      let ay = e.acceleration.y || 0;
      let az = e.acceleration.z || 0;
      let total = Math.sqrt(ax*ax + ay*ay + az*az);
      this.callback(total);
    });
  }
}
