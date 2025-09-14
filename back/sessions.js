export class SessionManager {
    constructor(pomodoroTimer) {
        this.pomodoroTimer = pomodoroTimer;
        this.focusBtn = document.getElementById('focusBtn');
        this.breakBtn = document.getElementById('breakBtn');
        this.longBreakBtn = document.getElementById('longBreakBtn');

        this.bindEvents();
    }

    bindEvents() {
        this.focusBtn.addEventListener('click', () => this.setSessionType('focus'));
        this.breakBtn.addEventListener('click', () => this.setSessionType('break'));
        this.longBreakBtn.addEventListener('click', () => this.setSessionType('longBreak'));
    }

    setSessionType(sessionType) {
        if (this.pomodoroTimer.isRunning) return;

        this.pomodoroTimer.currentSessionType = sessionType;
        this.pomodoroTimer.totalTime = this.pomodoroTimer.sessionTypes[sessionType] * 60;
        this.pomodoroTimer.timeLeft = this.pomodoroTimer.totalTime;

        this.pomodoroTimer.updateDisplay();
        this.pomodoroTimer.updateProgress();
        this.pomodoroTimer.updateLanguage();
        this.updateActiveSessionButton();
    }

    updateActiveSessionButton() {
        this.focusBtn.classList.remove('active');
        this.breakBtn.classList.remove('active');
        this.longBreakBtn.classList.remove('active');

        switch (this.pomodoroTimer.currentSessionType) {
            case 'focus': this.focusBtn.classList.add('active'); break;
            case 'break': this.breakBtn.classList.add('active'); break;
            case 'longBreak': this.longBreakBtn.classList.add('active'); break;
        }
    }
}