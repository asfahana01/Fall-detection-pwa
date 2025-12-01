function startApp() {
  requestSensorPermission();
  startSensorStream();
  console.log("Fall Detection Started");
}