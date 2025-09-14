export function sendNotification(title, body) {
    if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '🍅' });
    }
}