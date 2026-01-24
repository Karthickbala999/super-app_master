import API_CONFIG from '../config/api.config';

class NotificationService {
    constructor() {
        this.notifications = this.loadFromStorage();
    }

    loadFromStorage() {
        const stored = localStorage.getItem('notifications');
        return stored ? JSON.parse(stored) : [];
    }

    saveToStorage() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }

    async getNotifications() {
        // In a real app, you'd fetch from backend here.
        // For now, we'll return stored notifications.
        return this.notifications;
    }

    async addNotification(notification) {
        const newNotification = {
            id: Date.now(),
            date: new Date().toISOString(),
            read: false,
            ...notification
        };

        this.notifications = [newNotification, ...this.notifications];
        this.saveToStorage();

        // Trigger browser push notification if permitted
        this.showBrowserNotification(newNotification);

        return newNotification;
    }

    async markAsRead(id) {
        this.notifications = this.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        );
        this.saveToStorage();
    }

    async markAllAsRead() {
        this.notifications = this.notifications.map(n => ({ ...n, read: true }));
        this.saveToStorage();
    }

    async clearAll() {
        this.notifications = [];
        this.saveToStorage();
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    async requestPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support desktop notification');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }

    showBrowserNotification(notification) {
        if (Notification.permission === 'granted') {
            const options = {
                body: notification.message,
                icon: '/favicon.png', // Fallback icon
                badge: '/favicon.png',
                tag: 'order-update',
                vibrate: [200, 100, 200]
            };

            new Notification(notification.title || 'New Update', options);
        }
    }
}

const notificationService = new NotificationService();
export default notificationService;
