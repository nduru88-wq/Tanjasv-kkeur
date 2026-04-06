const clockEl = document.getElementById("clock");
const alarmStatusEl = document.getElementById("alarmStatus");
const alarmSoundEl = document.getElementById("alarmSound");

const openAlarmBtn = document.getElementById("openAlarmBtn");
const stopAlarmBtn = document.getElementById("stopAlarmBtn");
const clearAlarmBtn = document.getElementById("clearAlarmBtn");

const alarmModal = document.getElementById("alarmModal");
const cancelAlarmBtn = document.getElementById("cancelAlarmBtn");
const saveAlarmBtn = document.getElementById("saveAlarmBtn");

const hourUpBtn = document.getElementById("hourUpBtn");
const hourDownBtn = document.getElementById("hourDownBtn");
const minuteUpBtn = document.getElementById("minuteUpBtn");
const minuteDownBtn = document.getElementById("minuteDownBtn");

const hourValueEl = document.getElementById("hourValue");
const minuteValueEl = document.getElementById("minuteValue");
const soundSelect = document.getElementById("soundSelect");

let selectedHour = 0;
let selectedMinute = 0;

let alarmTime = null;
let alarmSoundType = "beep";
let alarmTriggered = false;
let beepInterval = null;
let audioContext = null;

function pad(number) {
  return String(number).padStart(2, "0");
}

function updatePickerDisplay() {
  hourValueEl.textContent = pad(selectedHour);
  minuteValueEl.textContent = pad(selectedMinute);
}

function setPickersToCurrentTime() {
  const now = new Date();
  selectedHour = now.getHours();
  selectedMinute = now.getMinutes();
  updatePickerDisplay();
}

function adjustHour(amount) {
  selectedHour = (selectedHour + amount + 24) % 24;
  updatePickerDisplay();
}

function adjustMinute(amount) {
  selectedMinute = (selectedMinute + amount + 60) % 60;
  updatePickerDisplay();
}

function openAlarmModal() {
  setPickersToCurrentTime();
  soundSelect.value = "beep";
  alarmModal.classList.remove("hidden");
}

function closeAlarmModal() {
  alarmModal.classList.add("hidden");
}

function updateClock() {
  const now = new Date();

  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

  clockEl.textContent = `${hours}:${minutes}:${seconds}`;

  const currentTime = `${hours}:${minutes}`;

  if (alarmTime && currentTime === alarmTime && !alarmTriggered) {
    triggerAlarm();
  }
}

function saveAlarm() {
  alarmTime = `${pad(selectedHour)}:${pad(selectedMinute)}`;
  alarmSoundType = soundSelect.value;
  alarmTriggered = false;

  alarmStatusEl.textContent =
    `Alarm sat til ${alarmTime} (${alarmSoundType === "beep" ? "Standard alarm" : "lyd1.mp3"})`;

  clearAlarmBtn.style.display = "inline-block";
  stopAlarmBtn.style.display = "none";

  closeAlarmModal();
}

function clearAlarm() {
  alarmTime = null;
  alarmTriggered = false;
  stopAlarm();

  alarmStatusEl.textContent = "Ingen alarm sat";
  clearAlarmBtn.style.display = "none";
  stopAlarmBtn.style.display = "none";
}

function triggerAlarm() {
  alarmTriggered = true;
  stopAlarmBtn.style.display = "inline-block";

  if (alarmSoundType === "mp3") {
    alarmSoundEl.currentTime = 0;
    alarmSoundEl.loop = true;
    alarmSoundEl.play().catch((err) => {
      console.log("Kunne ikke afspille mp3:", err);
    });
  } else {
    startBeepAlarm();
  }

  alarmStatusEl.textContent = `ALARM AKTIV (${alarmTime})`;
}

function stopAlarm() {
  alarmSoundEl.pause();
  alarmSoundEl.currentTime = 0;
  alarmSoundEl.loop = false;

  if (beepInterval) {
    clearInterval(beepInterval);
    beepInterval = null;
  }

  if (audioContext && audioContext.state !== "closed") {
    audioContext.close().catch(() => {});
    audioContext = null;
  }

  if (alarmTime) {
    alarmStatusEl.textContent =
      `Alarm sat til ${alarmTime} (${alarmSoundType === "beep" ? "Standard alarm" : "lyd1.mp3"})`;
  } else {
    alarmStatusEl.textContent = "Ingen alarm sat";
  }

  stopAlarmBtn.style.display = "none";
}

function startBeepAlarm() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  const playBeep = () => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.25, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.35);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.35);
  };

  playBeep();
  beepInterval = setInterval(playBeep, 700);
}

openAlarmBtn.addEventListener("click", openAlarmModal);
cancelAlarmBtn.addEventListener("click", closeAlarmModal);
saveAlarmBtn.addEventListener("click", saveAlarm);
clearAlarmBtn.addEventListener("click", clearAlarm);
stopAlarmBtn.addEventListener("click", stopAlarm);

hourUpBtn.addEventListener("click", () => adjustHour(1));
hourDownBtn.addEventListener("click", () => adjustHour(-1));
minuteUpBtn.addEventListener("click", () => adjustMinute(1));
minuteDownBtn.addEventListener("click", () => adjustMinute(-1));

alarmModal.addEventListener("click", (e) => {
  if (e.target === alarmModal) {
    closeAlarmModal();
  }
});

setInterval(updateClock, 1000);
updateClock();
updatePickerDisplay();
