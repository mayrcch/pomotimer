// config.js
import { translations } from "./translations.js"; // <-- NOVO: traz as traduções

export class ConfigManager {
    constructor() {
        // elementos
        this.settingsToggle = document.getElementById('settingsToggle');
        this.settingsWrapper = document.getElementById('settingsWrapper');
        this.settingsOverlay = document.getElementById('settingsOverlay');
        this.settingsMenu = document.getElementById('settingsMenu');
        this.settingsTitle = document.getElementById('settingsTitle');
        this.settingsMain = document.getElementById('settingsMain');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        this.backBtn = document.getElementById('backBtn');

        // submenus / itens
        this.submenus = Array.from(document.querySelectorAll('.settings-submenu'));
        this.menuItems = Array.from(document.querySelectorAll('.settings-item'));

        // alarm controls
        this.alarmSettings = document.getElementById('alarmSettings');
        this.soundMuteBtn = document.getElementById('soundMuteBtn');
        this.alarmVolume = document.getElementById('alarmVolume');
        this.volumeValue = document.getElementById('volumeValue');

        // notifications
        this.notificationsSettings = document.getElementById('notificationsSettings');
        this.enableNotificationsToggle = document.getElementById('enableNotificationsToggle');

        // audio do alarme
        this.alarmSound = new Audio('/sound/alarm.wav');
        this.alarmSound.volume = 0.5;
        if (this.alarmVolume) this.alarmVolume.value = 0.5;
        this.updateVolumeLabel();

        this.currentSubmenu = null; // <-- guarda qual submenu está aberto

        this.bindEvents();

        // inicializa título com o idioma atual (fallback 'pt')
        const lang = window.pomodoroTimer?.currentLang || 'pt';
        const t = translations[lang] || translations['pt'];
        if (this.settingsTitle) this.settingsTitle.textContent = t.settingsTitle;
    }

    bindEvents() {
        this.settingsToggle.addEventListener('click', () => this.openMain());
        this.closeSettingsBtn.addEventListener('click', () => this.closeAll());
        this.settingsOverlay.addEventListener('click', () => this.closeAll());

        // navegação para submenus
        this.menuItems.forEach(item => {
            const target = item.dataset.target;
            item.addEventListener('click', () => this.openSubmenu(target));
        });

        this.backBtn.addEventListener('click', () => this.backToMain());

        if (this.alarmVolume) {
            this.alarmVolume.addEventListener('input', () => {
                this.alarmSound.volume = parseFloat(this.alarmVolume.value);
                this.updateVolumeLabel();
            });
        }

        if (this.soundMuteBtn) {
            this.soundMuteBtn.addEventListener('click', () => {
                this.toggleMute();
            });
        }

        if (this.enableNotificationsToggle) {
            this.enableNotificationsToggle.addEventListener('change', () => {
                if (this.enableNotificationsToggle.checked && 'Notification' in window) {
                    Notification.requestPermission().then(() => {/* nada extra aqui */});
                }
            });
        }
    }

    openMain() {
        this.settingsWrapper.classList.add('open');
        this.showMain();
    }

    closeAll() {
        this.settingsWrapper.classList.remove('open');
        this.hideAllSubmenus();
        this.currentSubmenu = null;
        this.backBtn.classList.remove('visible');

        // usa tradução dinâmica
        const lang = window.pomodoroTimer?.currentLang || 'pt';
        const t = translations[lang] || translations['pt'];
        this.settingsTitle.textContent = t.settingsTitle;
    }

    showMain() {
        this.settingsMain.style.display = 'block';
        this.submenus.forEach(s => s.classList.remove('open'));
        this.backBtn.classList.remove('visible');

        // usa tradução dinâmica
        const lang = window.pomodoroTimer?.currentLang || 'pt';
        const t = translations[lang] || translations['pt'];
        this.settingsTitle.textContent = t.settingsTitle;
        this.currentSubmenu = null;
    }

    openSubmenu(id) {
        const submenu = document.getElementById(id);
        if (!submenu) return;

        this.hideAllSubmenus();
        this.settingsMain.style.display = 'none';
        submenu.classList.add('open');
        this.currentSubmenu = id;
        this.backBtn.classList.add('visible');

        // PEGA tradução atual e seta título conforme submenu (NÃO usar strings fixas)
        const lang = window.pomodoroTimer?.currentLang || 'pt';
        const t = translations[lang] || translations['pt'];

        switch (id) {
            case "alarmSettings":
                this.settingsTitle.textContent = t.settingsAlarm;
                break;
            case "notificationsSettings":
                this.settingsTitle.textContent = t.settingsNotifications;
                break;
            case "aboutPomodoro":
                this.settingsTitle.textContent = t.settingsAbout;
                break;
            default:
                this.settingsTitle.textContent = t.settingsTitle;
        }
    }

    backToMain() {
        this.showMain();
    }

    hideAllSubmenus() {
        this.submenus.forEach(s => s.classList.remove('open'));
    }

    toggleMute() {
        const vol = parseFloat(this.alarmVolume?.value || 0);
        if (vol > 0) {
            this._previousVolume = vol;
            if (this.alarmVolume) this.alarmVolume.value = 0;
            this.alarmSound.volume = 0;
        } else {
            const restore = (this._previousVolume || 0.5);
            if (this.alarmVolume) this.alarmVolume.value = restore;
            this.alarmSound.volume = parseFloat(this.alarmVolume.value);
        }
        this.updateVolumeLabel();
    }

    updateVolumeLabel() {
        if (!this.volumeValue) return;
        const v = Math.round(parseFloat(this.alarmVolume?.value || 0) * 100);
        this.volumeValue.textContent = v + '%';
    }

    // método chamado por pomo.js (nome compatível)
    playAlarm() {
        try {
            this.alarmSound.currentTime = 0;
            this.alarmSound.play();
        } catch (e) {
            console.warn('Erro ao tocar som', e);
        }
    }

    areNotificationsEnabled() {
        return !!(this.enableNotificationsToggle && this.enableNotificationsToggle.checked && Notification.permission === 'granted');
    }
}
