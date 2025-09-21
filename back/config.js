export class ConfigManager {
    constructor() {
        // elements
        this.settingsToggle = document.getElementById('settingsToggle');
        this.settingsWrapper = document.getElementById('settingsWrapper');
        this.settingsOverlay = document.getElementById('settingsOverlay');
        this.settingsMenu = document.getElementById('settingsMenu');
        this.settingsTitle = document.getElementById('settingsTitle');
        this.settingsMain = document.getElementById('settingsMain');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        this.backBtn = document.getElementById('backBtn');

        // submenus
        this.submenus = Array.from(document.querySelectorAll('.settings-submenu'));
        this.menuItems = Array.from(document.querySelectorAll('.settings-item'));

        // alarm controls
        this.alarmSettings = document.getElementById('alarmSettings');
        this.soundButtons = Array.from(this.alarmSettings.querySelectorAll('.sound-btn'));
        this.soundMuteBtn = document.getElementById('soundMuteBtn');
        this.alarmVolume = document.getElementById('alarmVolume');
        this.volumeValue = document.getElementById('volumeValue');

        // notifications controls
        this.notificationsSettings = document.getElementById('notificationsSettings');
        this.enableNotificationsToggle = document.getElementById('enableNotificationsToggle');

        // autostart and others
        this.autostartToggle = document.getElementById('autostartToggle');

        // internal state
        this.currentSubmenu = null;
        this.sounds = {
            sound1: new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg'),
            sound2: new Audio('https://actions.google.com/sounds/v1/alarms/medium_bell_ringing.ogg'),
            long: new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg')
        };
        this.selectedSound = 'sound1';
        this.sounds[this.selectedSound].volume = 0.5;
        this.alarmVolume.value = 0.5;
        this.updateVolumeLabel();

        this.bindEvents();
    }

    bindEvents() {
        // open/close main menu
        this.settingsToggle.addEventListener('click', () => this.openMain());
        this.closeSettingsBtn.addEventListener('click', () => this.closeAll());
        this.settingsOverlay.addEventListener('click', () => this.closeAll());

        // menu item navigation
        this.menuItems.forEach(item => {
            const target = item.dataset.target;
            item.addEventListener('click', () => this.openSubmenu(target));
        });

        // back button
        this.backBtn.addEventListener('click', () => this.backToMain());

        // alarm sound selection
        this.soundButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectSound(btn.dataset.sound);
            });
        });

        this.soundMuteBtn.addEventListener('click', () => {
            this.toggleMute();
        });

        // volume control
        this.alarmVolume.addEventListener('input', () => {
            this.updateVolumeLabel();
            this.setVolume(parseFloat(this.alarmVolume.value));
        });

        // notifications toggle
        this.enableNotificationsToggle.addEventListener('change', () => {
            if (this.enableNotificationsToggle.checked && 'Notification' in window) {
                Notification.requestPermission().then(() => {
                    // permission result handled by application if needed
                });
            }
        });
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
        this.settingsTitle.textContent = 'Personalize';
    }

    showMain() {
        this.settingsMain.style.display = 'block';
        this.submenus.forEach(s => s.classList.remove('open'));
        this.backBtn.classList.remove('visible');
        this.settingsTitle.textContent = 'Personalize';
    }

    openSubmenu(id) {
        const submenu = document.getElementById(id);
        if (!submenu) return;
        this.hideAllSubmenus();
        this.settingsMain.style.display = 'none';
        submenu.classList.add('open');
        this.currentSubmenu = id;
        this.backBtn.classList.add('visible');
        // titulos dos conteudos do submenu de config
        const titleMap = {
            alarmSettings: 'Personalize alarme',
            notificationsSettings: 'Notificações',
            aboutPomodoro: 'Sobre a técnica Pomodoro'
        };
        this.settingsTitle.textContent = titleMap[id] || 'Configurações';
    }

    backToMain() {
        this.showMain();
    }

    hideAllSubmenus() {
        this.submenus.forEach(s => s.classList.remove('open'));
    }

    selectSound(soundKey) {
        if (!this.sounds[soundKey]) return;
        // deactivate buttons
        this.soundButtons.forEach(b => b.classList.remove('active'));
        const btn = this.soundButtons.find(b => b.dataset.sound === soundKey);
        if (btn) btn.classList.add('active');

        this.selectedSound = soundKey;
        // ensure volume applied
        this.setVolume(parseFloat(this.alarmVolume.value));
    }

    toggleMute() {
        const vol = parseFloat(this.alarmVolume.value);
        if (vol > 0) {
            // store previous and mute
            this._previousVolume = vol;
            this.alarmVolume.value = 0;
            this.setVolume(0);
        } else {
            // restore previous
            this.alarmVolume.value = (this._previousVolume || 0.5);
            this.setVolume(parseFloat(this.alarmVolume.value));
        }
        this.updateVolumeLabel();
    }

    setVolume(value) {
        Object.values(this.sounds).forEach(s => { s.volume = value; });
        this.updateVolumeLabel();
    }

    updateVolumeLabel() {
        const v = Math.round(parseFloat(this.alarmVolume.value) * 100);
        this.volumeValue.textContent = v + '%';
    }

    playSelectedSound() {
        const s = this.sounds[this.selectedSound];
        if (!s) return;
        try {
            s.currentTime = 0;
            s.play();
        } catch (e) {
            // autoplay/permission issues ignored; app can still show notifications
            console.warn('Erro ao tocar som', e);
        }
    }

    areNotificationsEnabled() {
        return this.enableNotificationsToggle.checked && Notification.permission === 'granted';
    }
}
