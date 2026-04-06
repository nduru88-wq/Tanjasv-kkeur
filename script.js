let alarmTime = null;
let snoozeTimeout = null;
let selectedSound = "default";

function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("da-DK");
  document.getElementById("clock").textContent = timeString;

  if (alarmTime === timeString) {
    triggerAlarm();
  }
}

setInterval(updateClock, 1000);

function setAlarm() {
  let time = prompt("Indtast alarm (HH:MM:SS)");
  if (!time) return;

  let soundChoice = prompt("Skriv '1' for standard lyd eller '2' for lyd1.mp3");

  selectedSound = (soundChoice === "2") ? "mp3" : "default";

  alarmTime = time;
  alert("Alarm sat til " + alarmTime);
}

function triggerAlarm() {
  alarmTime = null;

  let audio;

  if (selectedSound === "mp3") {
    audio = document.getElementById("alarmSound");
  } else {
    audio = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
  }

  audio.loop = true;
  audio.play();

  let choice = prompt("Alarm!\n1: Stop\n2: Snooze");

  if (choice === "2") {
    audio.pause();
    snoozeTimeout = setTimeout(() => {
      triggerAlarm();
    }, 10 * 60 * 1000);
  } else {
    audio.pause();
  }
}
