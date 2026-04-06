const clockHoursEl = document.getElementById("clockHours");
const clockMinutesEl = document.getElementById("clockMinutes");
const clockColonEl = document.getElementById("clockColon");

const alarmStatusEl = document.getElementById("alarmStatus");
const alarmSoundEl = document.getElementById("alarmSound");

const openAlarmBtn = document.getElementById("openAlarmBtn");
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

const ringingModal = document.getElementById("ringingModal");
const ringingTimeEl = document.getElementById("ringingTime");
const stopAlarmBtn = document.getElementById("stopAlarmBtn");
const snoozeAlarmBtn = document.getElementById("snoozeAlarmBtn");

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

function setIdleStatus() {
  alarmStatusEl.textContent = "Ingen alarm sat";
  alarmStatusEl.classList.remove("status-set");
  alarmStatusEl.classList.add("status-idle");
}

function setAlarmStatusText() {
  if (alarmTime) {
    alarmStatusEl.textContent = `Alarm sat til ${alarmTime}`;
    alarmStatusEl.classList.remove("status-idle");
    alarmStatusEl.classList.add("status-set");
  } else {
    setIdleStatus();
  }
}

function updateClock() {
  const now = new Date();

  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = now.getSeconds();

  clockHoursEl.textContent = hours;
  clockMinutesEl.textContent = minutes;

  if (seconds % 2 === 0) {
    clockColonEl.classList.remove("colon-off");
  } else {
    clockColonEl.classList.add("colon-off");
  }

  const currentTime = `${hours}:${minutes}`;

  if (alarmTime && currentTime === alarmTime && !alarmTriggered) {
    triggerAlarm();
  }
}

function saveAlarm() {
  alarmTime = `${pad(selectedHour)}:${pad(selectedMinute)}`;
  alarmSoundType = soundSelect.value;
  alarmTriggered = false;

  setAlarmStatusText();
  clearAlarmBtn.style.display = "inline-block";

  closeAlarmModal();
}

function clearAlarm() {
  alarmTime = null;
  alarmTriggered = false;
  stopAlarmSoundOnly();
  hideRingingModal();

  setIdleStatus();
  clearAlarmBtn.style.display = "none";
}

function showRingingModal() {
  ringingTimeEl.textContent = alarmTime || "00:00";
  ringingModal.classList.remove("hidden");
}

function hideRingingModal() {
  ringingModal.classList.add("hidden");
}

function triggerAlarm() {
  alarmTriggered = true;
  showRingingModal();

  if (alarmSoundType === "mp3") {
    alarmSoundEl.currentTime = 0;
    alarmSoundEl.loop = true;
    alarmSoundEl.play().catch((err) => {
      console.log("Kunne ikke afspille mp3:", err);
    });
  } else {
    startBeepAlarm();
  }
}

function stopAlarmSoundOnly() {
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
}

function stopAlarmCompletely() {
  stopAlarmSoundOnly();
  hideRingingModal();

  alarmTime = null;
  alarmTriggered = false;
  clearAlarmBtn.style.display = "none";
  setIdleStatus();
}

function snoozeAlarm() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 10);

  alarmTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  alarmTriggered = false;

  stopAlarmSoundOnly();
  hideRingingModal();

  clearAlarmBtn.style.display = "inline-block";
  setAlarmStatusText();
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

hourUpBtn.addEventListener("click", () => adjustHour(1));
hourDownBtn.addEventListener("click", () => adjustHour(-1));
minuteUpBtn.addEventListener("click", () => adjustMinute(1));
minuteDownBtn.addEventListener("click", () => adjustMinute(-1));

stopAlarmBtn.addEventListener("click", stopAlarmCompletely);
snoozeAlarmBtn.addEventListener("click", snoozeAlarm);

alarmModal.addEventListener("click", (e) => {
  if (e.target === alarmModal) {
    closeAlarmModal();
  }
});

setInterval(updateClock, 1000);
updateClock();
updatePickerDisplay();
setIdleStatus();
