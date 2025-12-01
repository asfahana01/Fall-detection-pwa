class FallDetector {
  constructor(alertCallback) {
    this.alertCallback = alertCallback;
  }

  check(value) {
    if (value > 25) {
      this.alertCallback();
    }
  }
}
