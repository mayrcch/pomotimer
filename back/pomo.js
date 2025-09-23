import { translations } from "./translations.js";
import { TodoManager } from "./todos.js";
import { SessionManager } from "./sessions.js";
import { setupProgressRing, updateTimerDisplay, updateProgress } from "./ui.js";
import { sendNotification } from "./notifications.js";
import { ConfigManager } from "./config.js";

export default class PomodoroTimer {
  constructor() {
    this.sessionTypes = { focus: 25, break: 5, longBreak: 15 };
    this.currentSessionType = "focus";
    this.totalTime = this.sessionTypes[this.currentSessionType] * 60;
    this.timeLeft = this.totalTime;
    this.isRunning = false;
    this.intervalId = null;
    this.currentLang = "pt";

    this.timerDisplay = document.getElementById("timerDisplay");
    this.startBtn = document.getElementById("startBtn");
    this.stopBtn = document.getElementById("stopBtn");
    this.resetBtn = document.getElementById("resetBtn");
    this.progressCircle = document.querySelector(".progress-ring__progress");
    this.title = document.getElementById("title");
    this.sessionInfo = document.getElementById("sessionInfo");
    this.languageDropdown = document.getElementById("languageDropdown");
    this.languageCurrent = document.getElementById("languageCurrent");
    this.currentLangText = document.getElementById("currentLangText");
    this.languageOptions = document.getElementById("languageOptions");

    this.circumference = setupProgressRing(this.progressCircle);

    this.todoManager = new TodoManager(this);
    this.sessionManager = new SessionManager(this);
    this.configManager = new ConfigManager();

    // make managers accessible for inline handlers (todos used inline)
    window.pomodoroTimer = this;
    this.todoManagerInstance = this.todoManager;

    this.bindEvents();
    this.setupLanguageSelector();
    this.updateDisplay();
    this.updateLanguage();
    this.sessionManager.updateActiveSessionButton();
  }

  bindEvents() {
    this.startBtn.addEventListener("click", () => this.start());
    this.stopBtn.addEventListener("click", () => this.stop());
    this.resetBtn.addEventListener("click", () => this.reset());
  }

  setupLanguageSelector() {
    this.languageCurrent.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.languageDropdown.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!this.languageDropdown.contains(e.target)) {
        this.languageDropdown.classList.remove("open");
      }
    });

    const optionButtons =
      this.languageOptions.querySelectorAll(".language-option");
    optionButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const selectedLang = btn.dataset.lang;
        this.currentLang = selectedLang;
        const t = translations[selectedLang];
        this.currentLangText.textContent = t.langDisplay;

        this.languageDropdown.classList.remove("open");
        this.updateLanguage();
      });
    });
  }

  // 🔥 Função atualizada
  updateLanguage() {
    const t = translations[this.currentLang];

    // Timer / To-do
    this.title.textContent = t.title;
    this.todoManager.todoTitle.textContent = t.todoTitle;
    this.todoManager.todoInput.placeholder = t.todoPlaceholder;
    this.todoManager.addTodoBtn.textContent = t.addTodo;
    this.todoManager.emptyState.textContent = t.emptyState;

    document.getElementById("focusBtn").textContent = t.focus;
    document.getElementById("breakBtn").textContent = t.break;
    document.getElementById("longBreakBtn").textContent = t.longBreak;

    switch (this.currentSessionType) {
      case "focus": this.sessionInfo.textContent = t.focusSession; break;
      case "break": this.sessionInfo.textContent = t.breakSession; break;
      case "longBreak": this.sessionInfo.textContent = t.longBreakSession; break;
    }

    if (this.isRunning) {
      this.startBtn.textContent = t.running;
    } else if (this.timeLeft < this.totalTime && this.timeLeft > 0) {
      this.startBtn.textContent = t.continue;
    } else if (this.timeLeft === 0) {
      this.startBtn.textContent = t.completed;
    } else {
      this.startBtn.textContent = t.start;
    }

    this.stopBtn.textContent = t.pause;
    this.resetBtn.textContent = t.reset;

    // Configurações
    const setEl = id => document.getElementById(id);
    if (setEl("settingsTitle")) setEl("settingsTitle").textContent = t.settingsTitle;
    if (setEl("settingsAlarmLabel")) setEl("settingsAlarmLabel").childNodes[1].textContent = " " + t.settingsAlarm;
    if (setEl("settingsNotificationsLabel")) setEl("settingsNotificationsLabel").childNodes[1].textContent = " " + t.settingsNotifications;
    if (setEl("settingsHint")) setEl("settingsHint").textContent = t.settingsHint || "";
    if (setEl("settingsAboutLabel")) setEl("settingsAboutLabel").childNodes[1].textContent = " " + t.settingsAbout;

    const alarmLabel = document.querySelector("#alarmSettings label");
    if (alarmLabel) alarmLabel.childNodes[0].textContent = t.alarmVolume + " ";

    const muteBtn = document.getElementById("soundMuteBtn");
    if (muteBtn) muteBtn.title = t.mute;

    const notifLabel = document.querySelector("#notificationsSettings .toggle-row span");
    if (notifLabel) notifLabel.textContent = t.notifyWhenDone;

    const aboutTitle = document.querySelector("#aboutPomodoro .submenu-title");
    if (aboutTitle) aboutTitle.textContent = t.aboutTitle;

    const aboutText = document.querySelector("#aboutPomodoro .submenu-section p");
    if (aboutText && t.aboutText) aboutText.innerHTML = t.aboutText;

    // 🔑 Ajuste crucial: mantém título correto do submenu aberto
    if (this.configManager && this.configManager.currentSubmenu) {
      switch (this.configManager.currentSubmenu) {
        case 'alarmSettings':
          if (setEl('settingsTitle')) setEl('settingsTitle').textContent = t.settingsAlarm;
          break;
        case 'notificationsSettings':
          if (setEl('settingsTitle')) setEl('settingsTitle').textContent = t.settingsNotifications;
          break;
        case 'aboutPomodoro':
          if (setEl('settingsTitle')) setEl('settingsTitle').textContent = t.settingsAbout;
          break;
        default:
          if (setEl('settingsTitle')) setEl('settingsTitle').textContent = t.settingsTitle;
      }
    } else {
      if (setEl('settingsTitle')) setEl('settingsTitle').textContent = t.settingsTitle;
    }
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      const t = translations[this.currentLang];
      this.startBtn.textContent = t.running;
      this.startBtn.disabled = true;

      this.intervalId = setInterval(() => {
        this.timeLeft--;
        this.updateDisplay();
        this.updateProgress();
        if (this.timeLeft <= 0) this.complete();
      }, 1000);
    }
  }

  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      clearInterval(this.intervalId);
      const t = translations[this.currentLang];
      this.startBtn.textContent = t.continue;
      this.startBtn.disabled = false;
    }
  }

  reset() {
    this.isRunning = false;
    clearInterval(this.intervalId);
    this.timeLeft = this.totalTime;
    this.startBtn.disabled = false;
    this.updateDisplay();
    this.updateProgress();
    this.updateLanguage();
  }

  complete() {
    this.isRunning = false;
    clearInterval(this.intervalId);
    const t = translations[this.currentLang];
    this.startBtn.textContent = t.completed;
    this.startBtn.disabled = false;

    this.progressCircle.style.stroke = "#4CAF50";
    setTimeout(() => {
      this.progressCircle.style.stroke = "#ff6b6b";
    }, 2000);

    // notification via notifications module
    sendNotification(t.notificationTitle, t.notificationBody);

    // toca o alarme
    try {
      if (this.configManager) {
        this.configManager.playAlarm();
      }
    } catch (e) {
      console.warn("ConfigManager not available to play sound", e);
    }
  }

  updateDisplay() {
    updateTimerDisplay(this.timerDisplay, this.timeLeft);
    this.updatePageTitle(); // att o titulo da pagina
  }

  updatePageTitle() { // att o titulo da pagina ao iniciar qlqr timer
    const formattedTime = this.formatTime(this.timeLeft);
    if (this.isRunning) {
      document.title = `⏳ ${formattedTime} - Pomodoro`;
    } else if (this.timeLeft < this.totalTime && this.timeLeft > 0) {
      document.title = `⏸ ${formattedTime} - Pausado`;
    } else {
      document.title = "✦ Pomodoro Timer ‒ Focus!"; // título padrão
    }
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  updateProgress() {
    updateProgress(
      this.progressCircle,
      this.totalTime,
      this.timeLeft,
      this.circumference
    );
  }
}

// notificacao
let pomodoroTimer;
document.addEventListener("DOMContentLoaded", () => {
  pomodoroTimer = new PomodoroTimer();
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
});
