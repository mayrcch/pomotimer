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

  updateLanguage() {
    const t = translations[this.currentLang];
    this.title.textContent = t.title;
    this.todoManager.todoTitle.textContent = t.todoTitle;
    this.todoManager.todoInput.placeholder = t.todoPlaceholder;
    this.todoManager.addTodoBtn.textContent = t.addTodo;
    this.todoManager.emptyState.textContent = t.emptyState;

    document.getElementById("focusBtn").textContent = t.focus;
    document.getElementById("breakBtn").textContent = t.break;
    document.getElementById("longBreakBtn").textContent = t.longBreak;

    switch (this.currentSessionType) {
      case "focus":
        this.sessionInfo.textContent = t.focusSession;
        break;
      case "break":
        this.sessionInfo.textContent = t.breakSession;
        break;
      case "longBreak":
        this.sessionInfo.textContent = t.longBreakSession;
        break;
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

    // play alarm if configured
    try {
      if (this.configManager) {
        // play selected sound (best-effort)
        this.configManager.playSelectedSound();
      }
    } catch (e) {
      console.warn("ConfigManager not available to play sound", e);
    }
  }

  updateDisplay() {
    updateTimerDisplay(this.timerDisplay, this.timeLeft);
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

let pomodoroTimer;
document.addEventListener("DOMContentLoaded", () => {
  pomodoroTimer = new PomodoroTimer();
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
});
